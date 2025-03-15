import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { VehiclesRepository } from '../repository/vehicles.repository';
import { TelemetryRepository } from '../repository/telemetry.repository';

declare module 'fastify' {
    interface FastifyInstance {
        vehiclesRepository: VehiclesRepository,
        telemetryRepository: TelemetryRepository
    }
}

const repositories: FastifyPluginAsync = async (fastify) => {
    const telemetryRepository = new TelemetryRepository(fastify.influxClient, fastify.influxOrg);

    await telemetryRepository.init();

    fastify.decorate('vehiclesRepository', new VehiclesRepository(fastify.postgresdb));
    fastify.decorate('telemetryRepository', telemetryRepository);

    fastify.addHook('onClose', () => telemetryRepository.deinit())
};

export default fp(repositories, { name: Plugins.REPOSITORIES, dependencies: [Plugins.POSTGRESDB, Plugins.INFLUXDB] });
