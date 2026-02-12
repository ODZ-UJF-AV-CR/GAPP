import { type InfluxDB, Point, type QueryApi, type WriteApi } from '@influxdata/influxdb-client';
import { type Bucket, BucketsAPI, type Organization } from '@influxdata/influxdb-client-apis';
import type { PointType } from '../types/enums.ts';
import { arrayAsString } from '../utils/array-as-atring.ts';

export type LocationData = {
    _time: string;
    _measurement: PointType;
    altitude: number;
    callsign: string;
    latitude: number;
    longitude: number;
};

export interface TelemetryData extends Record<string, number | string | boolean | undefined> {
    timestamp: string;
    callsign: string;
    latitude: number;
    longitude: number;
    altitude: number;
}

export class TelemetryRepository {
    private readonly bucketName = 'telemetry';
    private writeApi: WriteApi;
    private queryAPi: QueryApi;

    constructor(
        private readonly client: InfluxDB,
        private readonly org: Organization,
    ) {}

    private async ensureBucket(name: string): Promise<Bucket> {
        const bucketsApi = new BucketsAPI(this.client);

        const buckets = await bucketsApi.getBuckets();
        let bucket = buckets.buckets.find((bucket) => bucket.name === name);
        if (!bucket) {
            bucket = await bucketsApi.postBuckets({
                body: {
                    orgID: this.org.id,
                    name,
                },
            });
        }

        return bucket;
    }

    public async init() {
        await this.ensureBucket(this.bucketName);

        this.writeApi = this.client.getWriteApi(this.org.id, this.bucketName);
        this.queryAPi = this.client.getQueryApi(this.org.id);
    }

    public async deinit() {
        await this.writeApi.close();
    }

    public writeTelemetry(pointType: PointType, data: TelemetryData) {
        const dataPoint = new Point(pointType);

        for (const [key, value] of Object.entries(data)) {
            if (key === 'callsign') {
                dataPoint.tag(key, value as string);
            } else if (key === 'timestamp') {
                dataPoint.timestamp(new Date(value as string));
            } else if (typeof value === 'string') {
                dataPoint.stringField(key, value);
            } else if (typeof value === 'number') {
                dataPoint.floatField(key, value);
            } else if (typeof value === 'boolean') {
                dataPoint.booleanField(key, value);
            }
        }

        this.writeApi.writePoint(dataPoint);
    }

    public async getCallsignsLastLocation(callsigns?: string[]): Promise<LocationData[]> {
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
}
