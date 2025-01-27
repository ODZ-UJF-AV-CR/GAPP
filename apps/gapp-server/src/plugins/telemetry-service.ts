import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { TelemetryService } from '../services/telemetry.service';

declare module 'fastify' {
    interface FastifyInstance {
        telemetryService: TelemetryService;
    }
}

const telemetryServicePlugin: FastifyPluginAsync = async (fastify) => {
    const telemetryService = new TelemetryService(fastify.influxClient, fastify.influxOrg);

    await telemetryService.init();

    fastify.decorate('telemetryService', telemetryService);
    fastify.addHook('onClose', async () => {
        await telemetryService.deinit();
    });
};

export default fp(telemetryServicePlugin, {
    name: Plugins.TELEMETRY_SERVICE,
    dependencies: [Plugins.INFLUXDB],
});
