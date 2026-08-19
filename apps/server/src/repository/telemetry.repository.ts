import type { TelemetryRecord } from '@gapp/shared';
import { type InfluxDB, Point, type QueryApi, type WriteApi } from '@influxdata/influxdb-client';
import { type Bucket, BucketsAPI, type Organization } from '@influxdata/influxdb-client-apis';
import { arrayAsString } from '../utils/array-as-string.ts';

export enum PointType {
    LOCATION = 'location',
}

const MAX_TELEMETRY_ROWS = 5000;

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

    public writeTelemetry(pointType: PointType, data: TelemetryRecord) {
        const { callsign, uploader_callsign, _time, ...measurements } = data;
        const dataPoint = new Point(pointType).tag('callsign', callsign).timestamp(new Date(_time));

        if (uploader_callsign) {
            dataPoint.tag('uploader_callsign', uploader_callsign);
        }

        // every remaining schema field is numeric, floatField keeps the type consistent with already stored data
        for (const [key, value] of Object.entries(measurements)) {
            if (value !== undefined) {
                dataPoint.floatField(key, value);
            }
        }

        this.writeApi.writePoint(dataPoint);
    }

    /** @description Sorted oldest first, capped to the newest packets so a busy beacon cannot blow up the response */
    public async getVehicleTelemetry(callsigns: string[], limit = MAX_TELEMETRY_ROWS): Promise<TelemetryRecord[]> {
        if (!callsigns.length) {
            return [];
        }

        const query = `from(bucket: "${this.bucketName}")
            |> range(start: -24h)
            |> filter(fn: (r) => contains(value: r.callsign, set: ${arrayAsString(callsigns)}))
            |> pivot(rowKey: ["_time", "callsign"], columnKey: ["_field"], valueColumn: "_value")
            |> drop(columns: ["_start", "_stop", "_measurement"])
            |> group()
            |> sort(columns: ["_time"])
            |> tail(n: ${limit})`;

        const rows = await this.queryAPi.collectRows<Record<string, unknown>>(query);

        // pivot fills every column for every row, so fields a packet never carried come back as null
        return rows.map(({ table, result, _start, _stop, _measurement, ...rest }) => {
            return Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== null)) as unknown as TelemetryRecord;
        });
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
            |> keep(columns: ["_time", "altitude", "longitude", "latitude", "callsign", "uploader_callsign"])
            |> group(columns: ["callsign"])
            |> sort(columns: ["_time"])
            |> last(column: "_time")`;

        return await this.queryAPi.collectRows(query);
    }
}
