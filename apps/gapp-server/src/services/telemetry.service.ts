import { InfluxDB, Point, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { InfluxDbServiceBase } from '../utils/influxdb-service-base';
import { Organization } from '@influxdata/influxdb-client-apis';
import { TelemetryPacket } from '@gapp/sondehub';
import { CarStatus } from '../schemas';
import { arrayAsString } from '../utils/array-as-atring';
import { EventBus } from '../utils/event-bus';
import { Events } from '../plugins/event-bus';
import { on } from 'events';
import { setInterval } from 'timers';

export interface CallsignLocation {
    callsign: string;
    latitude: number;
    longitude: number;
    altitude: number;
    _time: string;
}

export class TelemetryService extends InfluxDbServiceBase {
    private readonly bucket = 'telemetry';
    private writeApi: WriteApi;
    private queryAPi: QueryApi;
  private timer: NodeJS.Timer;

    constructor(
      private client: InfluxDB,
      org: Organization,
      private eventBus: EventBus<Events>
    ) {
        super(client, org.id);
    }

    public async init() {
        await this.ensureBucket(this.bucket);
        this.writeApi = this.client.getWriteApi(this.orgID, this.bucket);
        this.queryAPi = this.client.getQueryApi(this.orgID);

      this.timer = setInterval(() => {
        console.log('Runs: ', Date.now());
        this.eventBus.emit('stream.data', { data: 'ping' });
      }, 5_000);

      this.eventBus.on('influx.write', async () => {
        const lastData = await this.getCallsignsLastLocation([]);
        this.eventBus.emit('stream.data', { data: JSON.stringify(lastData) });
      });
    }

    public async deinit() {
      clearInterval(this.timer);
        await this.writeApi.close();
    }

    public writeVesselLocation(telemetry: TelemetryPacket) {
        const point = new Point('vessel_location')
            .timestamp(new Date(telemetry.time_received))
            .tag('callsign', telemetry.payload_callsign)
            .floatField('latitude', telemetry.lat)
            .floatField('longitude', telemetry.lon)
            .floatField('altitude', telemetry.alt)
            .floatField('heading', telemetry.heading)
            .floatField('vel_h', telemetry.vel_h);

        this.writeApi.writePoint(point);
    }

    public writeCarLocation(status: CarStatus) {
        const point = new Point('car_location')
            .timestamp(new Date(Date.now()))
            .tag('callsign', status.callsign)
            .floatField('latitude', status.latitude)
            .floatField('longitude', status.longitude)
            .floatField('altitude', status.altitude);

        this.writeApi.writePoint(point);
    }

    public async getCallsignsLastLocation(callsigns?: string[]): Promise<CallsignLocation[]> {
        let query = `from(bucket: "${this.bucket}")
            |> range(start: -24h)
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> keep(columns: ["_time", "altitude", "longitude", "latitude", "callsign"])`;

        if(callsigns?.length) {
          query = `from(bucket: "${this.bucket}")
              |> range(start: -24h)
              |> filter(fn: (r) => contains(value: r.callsign, set: ${arrayAsString(callsigns)}))
              |> last()
              |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
              |> keep(columns: ["_time", "altitude", "longitude", "latitude", "callsign"])`;
        }

        return await this.queryAPi.collectRows(query);
    }

    public getStreamGenerator() {
      return on(this.eventBus.emitter, 'stream.data');
    }
}
