import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { EventBus } from '../utils/event-bus';

export type Events = {
    'influx.write': [];
};

declare module 'fastify' {
    export interface FastifyInstance {
        eventBus: EventBus<Events>;
    }
}

const eventBus: FastifyPluginAsync = async (fastify) => {
    fastify.decorate('eventBus', new EventBus<Events>());
};

export default fp(eventBus, { name: Plugins.EVENT_BUS });
