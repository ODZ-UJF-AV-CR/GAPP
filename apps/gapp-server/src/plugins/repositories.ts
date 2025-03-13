import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { VehiclesRepository } from '../repository/vehicles.repository';

declare module 'fastify' {
    interface FastifyInstance {
        vehiclesRepository: VehiclesRepository
    }
}

const repositories: FastifyPluginAsync = async (fastify) => {
    fastify.decorate('vehiclesRepository', new VehiclesRepository(fastify.postgresdb));
};

export default fp(repositories, { name: Plugins.REPOSITORIES, dependencies: [Plugins.POSTGRESDB] });
