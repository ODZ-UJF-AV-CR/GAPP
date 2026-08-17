import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { BeaconService } from '../services/beacon.service.ts';
import { TelemetryService } from '../services/telemetry.service.ts';
import { VehicleService } from '../services/vehicle.service.ts';
import { Plugins } from './plugins.ts';

declare module 'fastify' {
    interface FastifyInstance {
        telemetryService: TelemetryService;
        vehicleService: VehicleService;
        beaconService: BeaconService;
    }
}

const services: FastifyPluginAsync = async (fastify) => {
    const telemetryService = new TelemetryService(
        fastify.telemetryRepository,
        fastify.vehiclesRepository,
        fastify.sondehub,
        fastify.eventBus,
        fastify.cache,
        fastify.log,
    );
    const vehicleService = new VehicleService(fastify.vehiclesRepository);
    const beaconService = new BeaconService(fastify.beaconsRepository, fastify.vehiclesRepository);

    fastify.decorate('telemetryService', telemetryService);
    fastify.decorate('vehicleService', vehicleService);
    fastify.decorate('beaconService', beaconService);
};

export default fp(services, { name: Plugins.SERVICES, dependencies: [Plugins.REPOSITORIES, Plugins.SONDEHUB, Plugins.EVENT_BUS, Plugins.CACHE] });
