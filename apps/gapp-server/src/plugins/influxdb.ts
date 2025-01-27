import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { InfluxDB, WriteApi } from '@influxdata/influxdb-client';
import { Plugins } from './plugins';
import { Organization, OrgsAPI } from '@influxdata/influxdb-client-apis';

interface InfluxdbPluginOptions extends FastifyPluginOptions {
    host: string;
    token: string;
    org: string;
}

declare module 'fastify' {
    interface FastifyInstance {
        influxClient: InfluxDB;
        influxOrg: Organization;
    }
}

const influxDbPlugin: FastifyPluginAsync<InfluxdbPluginOptions> = async (fastify, options) => {
    const influxClient = new InfluxDB({
        token: options.token,
        url: options.host,
        writeOptions: {
            batchSize: 10,
            writeSuccess: (lines: string[]) => {
                fastify.log.info(lines, 'Influx data written');
            },
        },
    });

    const orgsApi = new OrgsAPI(influxClient);
    const orgs = await orgsApi.getOrgs();
    let org = orgs.orgs.find((org) => org.name === options.org);
    if (!org) {
        fastify.log.info(`Creating organization ${options.org}`);
        org = await orgsApi.postOrgs({
            body: {
                name: options.org,
                description: 'Organization for storing telemetry data',
            },
        });
    }

    fastify.decorate('influxOrg', org);
    fastify.decorate('influxClient', influxClient);
};

export default fp(influxDbPlugin, {
    name: Plugins.INFLUXDB,
});
