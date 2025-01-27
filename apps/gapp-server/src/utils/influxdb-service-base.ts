import { InfluxDB } from '@influxdata/influxdb-client';
import { Bucket, BucketsAPI } from '@influxdata/influxdb-client-apis';

export abstract class InfluxDbServiceBase {
    constructor(protected readonly influxdbClient: InfluxDB, protected readonly orgID: string) {}

    public abstract init(): Promise<void>;
    public abstract deinit(): Promise<void>;

    protected async ensureBucket(name: string): Promise<Bucket> {
        const bucketsApi = new BucketsAPI(this.influxdbClient);

        const buckets = await bucketsApi.getBuckets();
        let bucket = buckets.buckets.find((bucket) => bucket.name === name);
        if (!bucket) {
            bucket = await bucketsApi.postBuckets({
                body: {
                    orgID: this.orgID,
                    name,
                },
            });
        }

        return bucket;
    }
}
