import Fastify from 'fastify';
import { app } from './app';
import { getConfig } from './config';
import pino from 'pino';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyStatic from '@fastify/static';
import path from 'path';

const config = getConfig(process.env);
const logger = pino();
const server = Fastify({ loggerInstance: logger, disableRequestLogging: true }).withTypeProvider<TypeBoxTypeProvider>();

server.register(app, {
    influxDbToken: config.INFLUXDB_TOKEN,
    influxDbHost: config.INFLUXDB_HOST,
    influxDbOrg: config.INFLUXDB_ORG,
    mongoDbUri: config.MONGODB_URI,
    isDevelopment: config.isDevelopment,
});

server.register(fastifyStatic, {
    root: path.join(__dirname, '../../../../gapp-dashboard/browser'),
});

server.setNotFoundHandler((request, reply) => {
  reply.sendFile('index.html');
})

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
