import { InfluxDB, Point, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { InfluxDbServiceBase } from '../utils/influxdb-service-base';
import { Organization } from '@influxdata/influxdb-client-apis';
import { CarsStatus, CarStatus } from '../schemas';
import { arrayAsString } from '../utils/array-as-atring';

export class CarsService extends InfluxDbServiceBase {
    private writeAPi: WriteApi;
    private queryAPi: QueryApi;

    constructor(private client: InfluxDB, private org: Organization) {
        super(client, org.id);
    }

    public async init() {
        await this.ensureBucket('cars');
        this.writeAPi = this.client.getWriteApi(this.org.id, 'cars', 'ms');
        this.queryAPi = this.client.getQueryApi(this.org.id);
    }

    public async deinit() {
        await this.writeAPi.close();
    }

    public writeCarStatus(callsign: string, status: CarStatus) {
        const point = new Point('car_status')
            .timestamp(Date.now())
            .tag('callsign', callsign)
            .floatField('latitude', status.latitude)
            .floatField('longitude', status.longitude)
            .floatField('altitude', status.altitude);

        this.writeAPi.writePoint(point);
    }

    public async getCarsStatus(callsigns: string[]): Promise<CarsStatus> {
        const query = `from(bucket: "cars")
            |> range(start: -24h)
            ${callsigns.length ? `|> filter(fn: (r) => contains(value: r.callsign, set: ${arrayAsString(callsigns)}))` : undefined}
            |> last()
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> keep(columns: ["_time", "altitude", "longitude", "latitude", "callsign"])`;

        return await this.queryAPi.collectRows(query);
    }
}
