import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins.ts';

declare module 'fastify' {
    export interface FastifyInstance {
        getAbortController: () => AbortController;
    }
}

const abortControllerPlugin: FastifyPluginAsync = async (fastify) => {
    const abortControllers = new Set<AbortController>();

    fastify.decorate('getAbortController', () => {
        const ac = new AbortController();
        abortControllers.add(ac);
        ac.signal.addEventListener('abort', () => abortControllers.delete(ac), { once: true });
        return ac;
    });

    fastify.addHook('preClose', () => {
        abortControllers.forEach((ac) => ac.abort());
    });
};

export default fp(abortControllerPlugin, { name: Plugins.ABORT_CONTROLLER });
