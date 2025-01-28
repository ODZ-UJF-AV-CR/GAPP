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
    const carsService = new CarsService(fastify.mongodb);
    await carsService.init();
    fastify.decorate('carsService', carsService);
};

export default fp(carsServicePlugin, {
    name: Plugins.CARS_SERVICE,
    dependencies: [Plugins.MONGODB],
});
