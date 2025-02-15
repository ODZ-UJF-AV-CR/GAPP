import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';

declare module 'fastify' {
    export interface FastifyInstance {
        getAbortController: () => AbortController;
    }
}

const eventBus: FastifyPluginAsync = async (fastify) => {
    const abortControllers: AbortController[] = [];

    fastify.decorate('getAbortController', () => {
        const ac = new AbortController();
        abortControllers.push(ac);
        return ac;
    });

    fastify.addHook('onClose', () => {
        abortControllers.forEach((ac) => ac.abort());
    });
};

export default fp(eventBus, { name: Plugins.ABORT_CONTROLLER });
