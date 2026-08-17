import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { BeaconGetSchema, BeaconsCreateSchema, BeaconsQuerySchema } from '@gapp/shared';

export const beaconController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '',
        {
            schema: {
                tags: ['beacon'],
                summary: 'Create beacons',
                description: 'Creates one or more beacons for existing vehicles.',
                body: BeaconsCreateSchema,
                response: {
                    201: Type.Array(BeaconGetSchema),
                },
            },
        },
        async (req, rep) => {
            const beacons = await req.server.beaconService.createBeacons(req.body);
            rep.status(201).send(beacons);
        },
    );

    fastify.get(
        '',
        {
            schema: {
                tags: ['beacon'],
                summary: 'Get beacons',
                description: 'Returns all beacons, optionally filtered by vehicle.',
                querystring: BeaconsQuerySchema,
                response: {
                    200: Type.Array(BeaconGetSchema),
                },
            },
        },
        async (req, rep) => {
            const beacons = await req.server.beaconService.getBeacons(req.query.vehicle_id);
            rep.status(200).send(beacons);
        },
    );

    fastify.delete(
        '/:id',
        {
            schema: {
                tags: ['beacon'],
                summary: 'Delete beacon',
                description: 'Deletes beacon with given id.',
                params: Type.Object({
                    id: Type.Number(),
                }),
                response: {
                    204: Type.Null(),
                },
            },
        },
        async (req, rep) => {
            await req.server.beaconService.deleteBeacon(req.params.id);
            rep.status(204).send(null);
        },
    );
};
