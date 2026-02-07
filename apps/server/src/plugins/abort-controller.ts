import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins.ts';

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
        ac.signal.addEventListener('abort', () => {
            const index = abortControllers.indexOf(ac);
            if (index !== -1) {
                abortControllers.splice(index, 1);
            }
        });
        return ac;
    });

    fastify.addHook('onClose', () => {
        abortControllers.forEach((ac) => ac.abort());
    });
};

export default fp(eventBus, { name: Plugins.ABORT_CONTROLLER });
