import fp from 'fastify-plugin';
import { type Cache, InMemoryCache } from '../utils/cache.ts';
import { Plugins } from './plugins.ts';

declare module 'fastify' {
    interface FastifyInstance {
        cache: Cache;
    }
}

export default fp(
    async (fastify) => {
        const cache = new InMemoryCache();
        fastify.decorate('cache', cache);
    },
    {
        name: Plugins.CACHE,
    },
);
