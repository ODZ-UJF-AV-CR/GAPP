import { InfluxDB, Point, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { InfluxDbServiceBase } from '../utils/influxdb-service-base';
import { Organization } from '@influxdata/influxdb-client-apis';
import { TelemetryPacket } from '@gapp/sondehub';
import { CarTelemetry, CallsignLocation } from '../schemas';
import { arrayAsString } from '../utils/array-as-atring';
import { EventBus } from '../utils/event-bus';
import { Events } from '../plugins/event-bus';
import { setInterval } from 'timers';
import { EventMessage } from 'fastify-sse-v2';
import { Collection, Db } from 'mongodb';
import { Vessel } from './vessels.service';
import { ensureCollection } from '../utils/ensure-collection';
import { Car } from './cars.service';

export class TelemetryService extends InfluxDbServiceBase {
    private readonly bucketName = 'telemetry';
    private writeApi: WriteApi;
    private queryAPi: QueryApi;
    private vesselsCollection: Collection<Vessel>;
    private carsCollection: Collection<Car>;

    constructor(private client: InfluxDB, org: Organization, private eventBus: EventBus<Events>, private db: Db) {
        super(client, org.id);
    }

    public async init() {
        const [vesselsCollection, carsCollection] = await Promise.all([
            ensureCollection<Vessel>(this.db, 'vessels'),
            ensureCollection<Car>(this.db, 'cars'),
            this.ensureBucket(this.bucketName),
        ]);

        this.vesselsCollection = vesselsCollection;
        this.carsCollection = carsCollection;
        this.writeApi = this.client.getWriteApi(this.orgID, this.bucketName);
        this.queryAPi = this.client.getQueryApi(this.orgID);
    }

    public async deinit() {
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

    public writeCarLocation(status: CarTelemetry) {
        const point = new Point('car_location')
            .timestamp(new Date(Date.now()))
            .tag('callsign', status.callsign)
            .floatField('latitude', status.latitude)
            .floatField('longitude', status.longitude)
            .floatField('altitude', status.altitude);

        this.writeApi.writePoint(point);
    }

    public async getCallsignsLastLocation(callsigns?: string[]): Promise<CallsignLocation[]> {
        let query = `from(bucket: "${this.bucketName}")
            |> range(start: -24h)
            |> last()
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> keep(columns: ["_time", "altitude", "longitude", "latitude", "callsign", "_measurement"])`;

        if (callsigns?.length) {
            query = `from(bucket: "${this.bucketName}")
                |> range(start: -24h)
                |> filter(fn: (r) => contains(value: r.callsign, set: ${arrayAsString(callsigns)}))
                |> last()
                |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
                |> keep(columns: ["_time", "altitude", "longitude", "latitude", "callsign", "_measurement"])`;
        }

        return await this.queryAPi.collectRows(query);
    }

    public async *streamGenerator(abortCotroller: AbortController, callsigns?: string[]): AsyncGenerator<EventMessage> {
        const abortSignal = abortCotroller.signal;
        const queue: EventMessage[] = [];
        const interval = setInterval(() => queue.push({ data: 'ping' }), 5_000);

        const eventHandler = async () => {
            const data = await this.getCallsignsLastLocation(callsigns);
            queue.push({ data: JSON.stringify(data) });
        };

        eventHandler();
        this.eventBus.on('influx.write', eventHandler);

        try {
            while (!abortSignal.aborted) {
                if (queue.length) {
                    yield queue.shift();
                } else {
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }
        } finally {
            if (interval) {
                clearInterval(interval);
            }

            this.eventBus.off('influx.write', eventHandler);
        }
    }
}
