import { FastifyPluginAsync } from 'fastify';
import { LocationService } from '../services/location.service';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';

declare module 'fastify' {
    interface FastifyInstance {
        locationService: LocationService;
    }
}

const locationsService: FastifyPluginAsync = async (fastify) => {
    const locationsService = new LocationService(fastify.influxClient, fastify.influxOrg);

    await locationsService.init();

    fastify.decorate('locationService', locationsService);
    fastify.addHook('onClose', async () => {
        await locationsService.deinit();
    });
};

export default fp(locationsService, {
    name: Plugins.LOCATIONS_SERVICE,
    dependencies: [Plugins.INFLUXDB],
});
