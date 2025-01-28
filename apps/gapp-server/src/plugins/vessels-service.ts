import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { VesselsService } from '../services/vessels.service';

declare module 'fastify' {
    interface FastifyInstance {
        vesselsService: VesselsService;
    }
}

const vesselsServicePlugin: FastifyPluginAsync = async (fastify) => {
    const vesselsService = new VesselsService(fastify.mongodb);
    await vesselsService.init();
    fastify.decorate('vesselsService', vesselsService);
};

export default fp(vesselsServicePlugin, {
    name: Plugins.VESSELS_SERVICE,
    dependencies: [Plugins.MONGODB],
});
