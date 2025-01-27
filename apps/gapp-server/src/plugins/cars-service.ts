import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { CarsService } from '../services/cars.service';

declare module 'fastify' {
    interface FastifyInstance {
        carsService: CarsService;
    }
}

const carsServicePlugin: FastifyPluginAsync = async (fastify) => {
    const carsService = new CarsService(fastify.influxClient, fastify.influxOrg);

    await carsService.init();

    fastify.decorate('carsService', carsService);
    fastify.addHook('onClose', async () => {
        await carsService.deinit();
    });
};

export default fp(carsServicePlugin, {
    name: Plugins.CARS_SERVICE,
    dependencies: [Plugins.INFLUXDB],
});
