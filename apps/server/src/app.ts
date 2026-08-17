import cors from '@fastify/cors';
import Sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { beaconController, liveDataController, telemetryController, vehicleController } from './controllers/index.ts';
import abortControllerPlugin from './plugins/abort-controller.ts';
import cachePlugin from './plugins/cache.ts';
import errorHandlerPlugin from './plugins/error-handler.ts';
import eventBusPlugin from './plugins/event-bus.ts';
import influxDbPlugin from './plugins/influxdb.ts';
import postgresDbPlugin from './plugins/postgresdb.ts';
import repositoriesPlugin from './plugins/repositories.ts';
import servicesPlugin from './plugins/services.ts';
import sondehubPlugin from './plugins/sondehub.ts';

interface AppOptions extends FastifyPluginOptions {
    influxDbToken: string;
    influxDbUrl: string;
    influxDbOrg: string;

    postgresDbUrl: string;

    defaultUploaderCallsign: string;
    ttnUploaderCallsign: string;

    isDevelopment: boolean;
}

export const app = async (fastify: FastifyInstance, opts: AppOptions) => {
    // LIBRARIES
    fastify.register(Sensible);
    fastify.register(eventBusPlugin);
    fastify.register(cors, {
        origin: '*',
        methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'],
    });

    // PLUGINS
    await fastify.register(errorHandlerPlugin);
    await fastify.register(influxDbPlugin, {
        url: opts.influxDbUrl,
        token: opts.influxDbToken,
        org: opts.influxDbOrg,
    });
    await fastify.register(postgresDbPlugin, { url: opts.postgresDbUrl });
    await fastify.register(sondehubPlugin, { dev: opts.isDevelopment, uploaderCallsign: opts.defaultUploaderCallsign });
    await fastify.register(abortControllerPlugin);
    await fastify.register(cachePlugin);
    await fastify.register(repositoriesPlugin);
    await fastify.register(servicesPlugin, {
        defaultUploaderCallsign: opts.defaultUploaderCallsign,
        ttnUploaderCallsign: opts.ttnUploaderCallsign,
    });

    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'GAPP API',
                version: '0.0.1',
                description: 'API Docs for ground app',
            },
            tags: [
                { name: 'vehicle', description: 'API for vehicles (Cars, Vessels, Balloons, etc.)' },
                { name: 'beacon', description: 'API for beacons attached to vehicles' },
                { name: 'telemetry', description: 'API for receiving telemetry data from cars and vessels' },
                { name: 'live-data', description: 'Server sent events streams with live data' },
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
            fastify.register(beaconController, { prefix: '/beacons' });
            fastify.register(liveDataController, { prefix: '/live-data' });
            fastify.get('/ping', () => 'pong');
        },
        { prefix: '/api' },
    );
};
