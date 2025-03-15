import { InfluxDB, Point, QueryApi, WriteApi } from "@influxdata/influxdb-client";
import { Bucket, BucketsAPI, Organization } from "@influxdata/influxdb-client-apis";
import { CallsignLocation } from "../schemas";
import { arrayAsString } from "../utils/array-as-atring";

export interface TelemetryData {
    timestamp: Date;
    callsign: string;
    latitude: number;
    longitude: number;
    altitude: number;
}

export interface TelemetryAdditionalData {
    [key: string]: number | string | boolean;
}

export enum PointType {
    LOCATION = 'location',
}

export class TelemetryRepository {
    private readonly bucketName = 'telemetry';
    private writeApi: WriteApi;
    private queryAPi: QueryApi;

    constructor(
        private readonly client: InfluxDB,
        private readonly org: Organization,
    ) { }

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

    public writeTelemetry(pointType: PointType, data: TelemetryData, additionalData: TelemetryAdditionalData) {
        const dataPoint = new Point(pointType)
            .tag('callsign', data.callsign)
            .floatField('latitude', data.latitude)
            .floatField('longitude', data.longitude)
            .floatField('altitude', data.altitude);

        for (const [key, value] of Object.entries(additionalData)) {
            if(typeof value === 'string') {
                dataPoint.stringField(key, value);
            } else if(typeof value === 'number') {
                dataPoint.floatField(key, value);
            } else if(typeof value === 'boolean') {
                dataPoint.booleanField(key, value);
            }
        }

        this.writeApi.writePoint(dataPoint);
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
}
