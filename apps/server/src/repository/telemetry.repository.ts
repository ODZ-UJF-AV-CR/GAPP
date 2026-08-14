import type { GenericTelemetry } from '@gapp/shared';
import { type InfluxDB, Point, type QueryApi, type WriteApi } from '@influxdata/influxdb-client';
import { type Bucket, BucketsAPI, type Organization } from '@influxdata/influxdb-client-apis';
import { arrayAsString } from '../utils/array-as-atring.ts';

export enum PointType {
    LOCATION = 'location',
}

export type LocationData = {
    _time: string;
    altitude: number;
    callsign: string;
    latitude: number;
    longitude: number;
    uploader_callsign?: string;
};

export type LastContactData = {
    _time: string;
    uploader_callsign: string;
};

export class TelemetryRepository {
    private readonly bucketName = 'telemetry';
    private readonly orgId: string;
    private _writeApi?: WriteApi;
    private _queryAPi?: QueryApi;

    constructor(
        private readonly client: InfluxDB,
        org: Organization,
    ) {
        if (!org.id) {
            throw new Error('Organization id is required');
        }

        this.orgId = org.id;
    }

    private get writeApi(): WriteApi {
        if (!this._writeApi) {
            throw new Error('influxDB APi is not initialized');
        }

        return this._writeApi;
    }

    private get queryAPi(): QueryApi {
        if (!this._queryAPi) {
            throw new Error('influxDB APi is not initialized');
        }

        return this._queryAPi;
    }

    private async ensureBucket(name: string): Promise<Bucket> {
        const bucketsApi = new BucketsAPI(this.client);

        const buckets = await bucketsApi.getBuckets();
        let bucket = buckets.buckets?.find((bucket) => bucket.name === name);
        if (!bucket) {
            bucket = await bucketsApi.postBuckets({
                body: {
                    orgID: this.orgId,
                    name,
                },
            });
        }

        return bucket;
    }

    public async init() {
        await this.ensureBucket(this.bucketName);

        this._writeApi = this.client.getWriteApi(this.orgId, this.bucketName);
        this._queryAPi = this.client.getQueryApi(this.orgId);
    }

    public async deinit() {
        await this.writeApi.close();
    }

    public writeTelemetry(pointType: PointType, data: GenericTelemetry) {
        const dataPoint = new Point(pointType);

        for (const [key, value] of Object.entries(data)) {
            if (key === 'callsign') {
                dataPoint.tag(key, value as string);
            } else if (key === 'uploader_callsign') {
                dataPoint.tag(key, value as string);
            } else if (key === '_time') {
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

    public async getUploadersLastContact(callsigns?: string[]): Promise<LastContactData[]> {
        const uploaderFilter = callsigns?.length
            ? `|> filter(fn: (r) => contains(value: r.uploader_callsign, set: ${arrayAsString(callsigns)}))`
            : `|> filter(fn: (r) => exists r.uploader_callsign)`;

        // group + sort + last collapses the one row per series that last() returns into one row per uploader
        const query = `from(bucket: "${this.bucketName}")
            |> range(start: -24h)
            ${uploaderFilter}
            |> last()
            |> keep(columns: ["_time", "uploader_callsign"])
            |> group(columns: ["uploader_callsign"])
            |> sort(columns: ["_time"])
            |> last(column: "_time")`;

        return await this.queryAPi.collectRows(query);
    }

    public async getCallsignsLastLocation(callsigns?: string[]): Promise<LocationData[]> {
        const callsignFilter = callsigns?.length ? `|> filter(fn: (r) => contains(value: r.callsign, set: ${arrayAsString(callsigns)}))` : '';

        // group + sort + last collapses the one row per series that last() returns into one row per callsign
        const query = `from(bucket: "${this.bucketName}")
            |> range(start: -24h)
            ${callsignFilter}
            |> last()
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> keep(columns: ["_time", "altitude", "longitude", "latitude", "callsign"])
            |> group(columns: ["callsign"])
            |> sort(columns: ["_time"])
            |> last(column: "_time")`;

        return await this.queryAPi.collectRows(query);
    }
}
