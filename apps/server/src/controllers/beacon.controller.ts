import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { BeaconGetSchema, BeaconsCreateSchema, BeaconsQuerySchema } from '@gapp/shared';
import { ConflictError, NotFoundError } from '../utils/errors.ts';

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
            try {
                const beacons = await req.server.beaconService.createBeacons(req.body);
                rep.status(201).send(beacons);
            } catch (err) {
                const e = err as Error & { constraint?: string };

                if (e instanceof NotFoundError) {
                    return rep.notFound(e.message);
                }
                if (e instanceof ConflictError || e.constraint === 'beacons_callsign_key') {
                    return rep.conflict(e instanceof ConflictError ? e.message : 'Beacon callsign already exists.');
                }

                req.server.log.error(e, 'Error creating beacons');
                return rep.internalServerError('Error creating beacons');
            }
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
            try {
                const beacons = await req.server.beaconService.getBeacons(req.query.vehicle_id);
                rep.status(200).send(beacons);
            } catch (e) {
                req.server.log.error(e, 'Error getting beacons');
                return rep.internalServerError('Error getting beacons');
            }
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
            try {
                await req.server.beaconService.deleteBeacon(req.params.id);
                rep.status(204).send(null);
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return rep.notFound(e.message);
                }

                req.server.log.error(e, 'Error deleting beacon');
                return rep.internalServerError('Error deleting beacon');
            }
        },
    );
};
