import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { OptionalCallsignQuery } from '@gapp/shared';
import { FastifySSEPlugin } from 'fastify-sse-v2';

export const liveDataController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.register(FastifySSEPlugin);

    fastify.get(
        '/dashboard',
        {
            schema: {
                tags: ['live-data'],
                summary: 'Get live dashboard data',
                description:
                    'Stream dashboard data using server sent events. Initial message contains all last known positions and uploader contacts, following messages contain only updates. callsign query parameter can contain multiple callsigns separated by ",".',
                querystring: OptionalCallsignQuery,
            },
        },
        async (req, rep) => {
            const ac = req.server.getAbortController();
            req.raw.on('close', () => ac.abort());
            const callsigns = req.query.callsign?.split(',').filter(Boolean);
            rep.sse(req.server.telemetryService.getDashboardStream(callsigns)(ac));
        },
    );
};
