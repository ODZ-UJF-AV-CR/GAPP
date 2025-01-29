import { FastifyPluginAsync } from 'fastify';
import { TelemetryService } from '../services/telemetry.service';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';

declare module 'fastify' {
    interface FastifyInstance {
        telemetryService: TelemetryService;
    }
}

const telemetryService: FastifyPluginAsync = async (fastify) => {
    const telemetryService = new TelemetryService(fastify.influxClient, fastify.influxOrg);

    await telemetryService.init();

    fastify.decorate('telemetryService', telemetryService);
    fastify.addHook('onClose', async () => {
        await telemetryService.deinit();
    });
};

export default fp(telemetryService, {
    name: Plugins.LOCATIONS_SERVICE,
    dependencies: [Plugins.INFLUXDB],
});
