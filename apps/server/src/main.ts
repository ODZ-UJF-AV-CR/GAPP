import path from 'node:path';
import fastifyStatic from '@fastify/static';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify from 'fastify';
import pino from 'pino';
import { app } from './app.ts';
import { getConfig } from './config.ts';

const logger = pino();
const config = getConfig(process.env);
const server = Fastify({ loggerInstance: logger, disableRequestLogging: true }).withTypeProvider<TypeBoxTypeProvider>();

server.register(app, {
    influxDbToken: config.INFLUXDB_TOKEN,
    influxDbHost: config.INFLUXDB_HOST,
    influxDbOrg: config.INFLUXDB_ORG,
    isDevelopment: config.isDevelopment,
    postgresDbUri: config.POSTGRESDB_URI,
});

if (config.isProd) {
    server.register(fastifyStatic, {
        root: path.join(import.meta.dirname, '../../../../gapp-dashboard/browser'),
    });

    server.setNotFoundHandler((_request, reply) => {
        reply.sendFile('index.html');
    });
}

server.listen({ port: config.PORT, host: '0.0.0.0' }, (err) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    await server.close();
    server.log.info('Server stopped');
});
