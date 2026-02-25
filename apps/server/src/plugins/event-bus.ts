import type { GenericTelemetry } from '@gapp/shared';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EventBus } from '../utils/event-bus.ts';
import { Plugins } from './plugins.ts';

export type Events = {
    'telemetry.new': [GenericTelemetry];
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
