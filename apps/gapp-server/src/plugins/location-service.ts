import { FastifyPluginAsync } from 'fastify';
import { TelemetryService } from '../services/telemetry.service';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';

declare module 'fastify' {
    interface FastifyInstance {
        telemetryService: TelemetryService;
    }
}

const locationsService: FastifyPluginAsync = async (fastify) => {
    const locationsService = new TelemetryService(fastify.influxClient, fastify.influxOrg);

    await locationsService.init();

    fastify.decorate('telemetryService', locationsService);
    fastify.addHook('onClose', async () => {
        await locationsService.deinit();
    });
};

export default fp(locationsService, {
    name: Plugins.LOCATIONS_SERVICE,
    dependencies: [Plugins.INFLUXDB],
});
