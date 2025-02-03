import { FastifyPluginAsync } from 'fastify';
import { TelemetryService } from '../services/telemetry.service';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { CarsService } from '../services/cars.service';
import { VesselsService } from '../services/vessels.service';

declare module 'fastify' {
    interface FastifyInstance {
        telemetryService: TelemetryService;
        carsService: CarsService;
      vesselsService: VesselsService;
    }
}

const services: FastifyPluginAsync = async (fastify) => {
    const telemetryService = new TelemetryService(fastify.influxClient, fastify.influxOrg, fastify.eventBus);
    const carsService = new CarsService(fastify.mongodb);
    const vesselsService = new VesselsService(fastify.mongodb);

    await carsService.init();
    await telemetryService.init();
    await vesselsService.init();

    fastify.decorate('telemetryService', telemetryService);
    fastify.decorate('carsService', carsService);
    fastify.decorate('vesselsService', vesselsService);

    fastify.addHook('onClose', async () => {
        await telemetryService.deinit();
    });
};

export default fp(services, {name: Plugins.SERVICES, dependencies: [Plugins.INFLUXDB, Plugins.MONGODB] });
