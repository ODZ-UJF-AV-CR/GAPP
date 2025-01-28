import { Q_OptionalCallsign, R_CarsStatus } from '../schemas';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

export const carsController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get(
        '/status',
        {
            schema: {
                summary: 'Get cars positions',
                description: 'Get latest location for all registered cars.',
                tags: ['cars'],
                querystring: Q_OptionalCallsign,
                response: {
                    200: R_CarsStatus,
                },
            },
        },
        async (req, rep) => {
            const callsigns = req.query.callsign?.split(',') || [];

            const carsStatus = await req.server.telemetryService.getCallsignsLastLocation(callsigns);
            rep.status(200).send(carsStatus);
        }
    );
};
