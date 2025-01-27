import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import sensible from '@fastify/sensible';
import influxDbPlugin from './plugins/influxdb';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { carsController } from './controllers/cars.controller';
import sondehubPlugin from './plugins/sondehub';
import { sondesController } from './controllers/sondes.controller';
import carsServicePlugin from './plugins/cars-service';
import telemetryServicePlugin from './plugins/telemetry-service';

interface AppOptions extends FastifyPluginOptions {
    influxDbToken: string;
    influxDbHost: string;
    influxDbOrg: string;
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
    await fastify.register(sondehubPlugin, { dev: true });
    await fastify.register(carsServicePlugin);
    await fastify.register(telemetryServicePlugin);

    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'GAPP API',
                version: '0.0.1',
                description: 'API Docs for ground app',
            },
            tags: [
                { name: 'cars', description: 'Chase cars API' },
                { name: 'sondes', description: 'Sondes telemetry APi' },
            ],
        },
    });
    await fastify.register(swaggerUi, { routePrefix: '/docs', uiConfig: {} });

    // ROUTES
    fastify.register(carsController, { prefix: '/cars' });
    fastify.register(sondesController, { prefix: '/sondes' });

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
