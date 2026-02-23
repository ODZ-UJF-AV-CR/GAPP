import { InfluxDB } from '@influxdata/influxdb-client';
import { type Organization, OrgsAPI } from '@influxdata/influxdb-client-apis';
import type { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins.ts';

interface InfluxdbPluginOptions extends FastifyPluginOptions {
    url: string;
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
        url: options.url,
        writeOptions: {
            batchSize: 100,
            flushInterval: 10_000,
            writeSuccess: (lines: string[]) => {
                fastify.log.debug(lines, 'Influx data written');
            },
            writeFailed(error, lines) {
                fastify.log.error(error, 'Error while writing data to influxdb');
                fastify.log.warn(lines, 'Dropped lines');
            },
        },
    });

    try {
        const orgsApi = new OrgsAPI(influxClient);
        const orgs = await orgsApi.getOrgs();
        let org = orgs.orgs.find((org) => org.name === options.org);
        if (!org) {
            fastify.log.info(`Creating organization ${options.org}`);
            org = await orgsApi.postOrgs({
                body: {
                    name: options.org,
                    description: 'Organization for storing high altitude ballon flights data',
                },
            });
        }

        fastify.decorate('influxOrg', org);
        fastify.decorate('influxClient', influxClient);
        fastify.log.info('Connected to InfluxDB');
    } catch (err) {
        fastify.log.fatal(err, 'Failed to connect to InfluxDB');
        process.exit(1);
    }
};

export default fp(influxDbPlugin, { name: Plugins.INFLUXDB, dependencies: [Plugins.EVENT_BUS] });
