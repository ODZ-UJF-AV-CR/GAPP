import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { Organization } from '@influxdata/influxdb-client-apis';
import { InfluxDbServiceBase } from '../utils/influxdb-service-base';
import { TelemetryPacket } from '@gapp/sondehub';

export class TelemetryService extends InfluxDbServiceBase {
    private writeAPi: WriteApi;

    constructor(private client: InfluxDB, private org: Organization) {
        super(client, org.id);
    }

    public async init() {
        await this.ensureBucket('telemetry');
        this.writeAPi = this.client.getWriteApi(this.org.id, 'telemetry', 'ms');
    }

    public async deinit() {
        await this.writeAPi.close();
    }

    public writeTelemetry(telemetry: TelemetryPacket) {
        const point = new Point('telemetry_packet')
            .timestamp(new Date(telemetry.time_received))
            .tag('callsign', telemetry.payload_callsign)
            .floatField('latitude', telemetry.lat)
            .floatField('longitude', telemetry.lon)
            .floatField('altitude', telemetry.alt)
            .floatField('heading', telemetry.heading)
            .floatField('vel_h', telemetry.vel_h);

        this.writeAPi.writePoint(point);
    }
}
