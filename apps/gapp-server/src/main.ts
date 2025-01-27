import Fastify from 'fastify';
import { app } from './app';
import { getConfig } from './config';
import pino from 'pino';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

const config = getConfig(process.env);
const logger = pino();
const server = Fastify({ loggerInstance: logger, disableRequestLogging: true }).withTypeProvider<TypeBoxTypeProvider>();

server.register(app, {
    influxDbToken: config.INFLUXDB_TOKEN,
    influxDbHost: config.INFLUXDB_HOST,
    influxDbOrg: config.INFLUXDB_ORG,
});

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
