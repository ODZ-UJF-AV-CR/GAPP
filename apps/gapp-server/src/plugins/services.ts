import { FastifyPluginAsync } from 'fastify';
import { TelemetryService } from '../services/telemetry.service';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { VehicleService } from '../services/vehicle.service';

declare module 'fastify' {
    interface FastifyInstance {
        telemetryService: TelemetryService;
        vehicleService: VehicleService;
    }
}

const services: FastifyPluginAsync = async (fastify) => {
    const telemetryService = new TelemetryService(fastify.telemetryRepository, fastify.vehiclesRepository, fastify.sondehub, fastify.eventBus);
    const vehicleService = new VehicleService(fastify.vehiclesRepository);

    fastify.decorate('telemetryService', telemetryService);
    fastify.decorate('vehicleService', vehicleService);
};

export default fp(services, { name: Plugins.SERVICES, dependencies: [Plugins.REPOSITORIES, Plugins.SONDEHUB, Plugins.EVENT_BUS] });
