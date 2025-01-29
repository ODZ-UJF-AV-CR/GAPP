import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import sensible from '@fastify/sensible';
import influxDbPlugin from './plugins/influxdb';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { carsController } from './controllers/cars.controller';
import sondehubPlugin from './plugins/sondehub';
import vesselsServicePlugin from './plugins/vessels-service';
import { vesselsController } from './controllers/vessels.controller';
import carsServicePlugin from './plugins/cars-service';
import telemetryServicePlugin from './plugins/telemetry-service';
import mongoDbPlugin from './plugins/mongodb';
import { telemetryController } from './controllers/telemetry.controller';

interface AppOptions extends FastifyPluginOptions {
    influxDbToken: string;
    influxDbHost: string;
    influxDbOrg: string;

    mongoDbUri: string;

    isDevelopment: boolean;
}

export const app = async (fastify: FastifyInstance, opts: AppOptions) => {
    // LIBRARIES
    fastify.register(sensible);

    // PLUGINS
    await fastify.register(influxDbPlugin, {
        host: opts.influxDbHost,
        token: opts.influxDbToken,
        org: opts.influxDbOrg,
    });
    await fastify.register(mongoDbPlugin, { uri: opts.mongoDbUri });
    await fastify.register(sondehubPlugin, { dev: opts.isDevelopment });
    await fastify.register(carsServicePlugin);
    await fastify.register(telemetryServicePlugin);
    await fastify.register(vesselsServicePlugin);

    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'GAPP API',
                version: '0.0.1',
                description: 'API Docs for ground app',
            },
            tags: [
                { name: 'cars', description: 'Chase cars API' },
                { name: 'vessel', description: 'API for vessels (Balloons, UAVs)' },
                { name: 'telemetry', description: 'API for receiving telemetry data from cars and vessels' },
            ],
        },
    });
    await fastify.register(swaggerUi, { routePrefix: '/docs', uiConfig: {} });

    // ROUTES
    fastify.register(carsController, { prefix: '/cars' });
    fastify.register(vesselsController, { prefix: '/vessels' });
    fastify.register(telemetryController, { prefix: '/telemetry' });

    fastify.get(
        '/ping',
        {
            schema: {
                hide: true,
            },
        },
        () => `pong\n\n${new Date().toString()}`
    );
};
