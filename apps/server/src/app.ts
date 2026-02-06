import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import Sensible from '@fastify/sensible';
import influxDbPlugin from './plugins/influxdb';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import sondehubPlugin from './plugins/sondehub';
import postgresDbPlugin from './plugins/postgresdb';
import repositoriesPlugin from './plugins/repositories';
import servicesPlugin from './plugins/services';
import eventBusPlugin from './plugins/event-bus';
import abortControllerPlugin from './plugins/abort-controller';
import cors from '@fastify/cors';
import { telemetryController, vehicleController } from './controllers';

interface AppOptions extends FastifyPluginOptions {
    influxDbToken: string;
    influxDbHost: string;
    influxDbOrg: string;

    postgresDbUri: string;

    isDevelopment: boolean;
}

export const app = async (fastify: FastifyInstance, opts: AppOptions) => {
    // LIBRARIES
    fastify.register(Sensible);
    fastify.register(eventBusPlugin);
    fastify.register(cors, {
        origin: '*',
    });

    // PLUGINS
    await fastify.register(influxDbPlugin, {
        host: opts.influxDbHost,
        token: opts.influxDbToken,
        org: opts.influxDbOrg,
    });
    await fastify.register(postgresDbPlugin, { uri: opts.postgresDbUri });
    await fastify.register(sondehubPlugin, { dev: opts.isDevelopment });
    await fastify.register(abortControllerPlugin);
    await fastify.register(repositoriesPlugin);
    await fastify.register(servicesPlugin);

    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'GAPP API',
                version: '0.0.1',
                description: 'API Docs for ground app',
            },
            tags: [
                { name: 'vehicle', description: 'API for vehicles (Cars, Vessels, Balloons, etc.)' },
                { name: 'telemetry', description: 'API for receiving telemetry data from cars and vessels' },
            ],
        },
    });
    await fastify.register(swaggerUi, {
        routePrefix: '/docs',
        theme: {
            title: 'GAPP API - Docs',
        },
    });

    // ROUTES
    fastify.register(
        async (fastify) => {
            fastify.register(telemetryController, { prefix: '/telemetry' });
            fastify.register(vehicleController, { prefix: '/vehicles' });
        },
        { prefix: '/api' }
    );

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
