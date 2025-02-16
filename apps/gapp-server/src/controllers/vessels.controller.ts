import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_Vessel, R_Vessel } from '../schemas/vessel.schema';
import { Type } from '@sinclair/typebox';

export const vesselsController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '',
        {
            schema: {
                summary: 'Adds new vessel',
                description: 'Creates new vessel (Balloon, UAV) with transmitters',
                tags: ['vessel'],
                body: B_Vessel,
                response: {
                    200: R_Vessel,
                },
            },
        },
        async (req, rep) => {
            try {
                const inserted = await req.server.vesselsService.addVessel(req.body);
                const vessel = {
                    ...req.body,
                    _id: inserted.insertedId.toString(),
                };

                req.server.log.debug(vessel, 'Created new vessel');
                rep.status(200).send(vessel);
            } catch (err) {
                req.server.log.error(err, 'Failed to create car');
                return rep.conflict(err.message);
            }
        }
    );

    fastify.get(
        '',
        {
            schema: {
                summary: 'Geat all vessels',
                description: 'Get all vessels from database with latest location data',
                tags: ['vessel'],
                response: {
                    200: Type.Array(R_Vessel),
                },
            },
        },
        async (req, rep) => {
            const vessels = await req.server.vesselsService.getVessels();

            rep.status(200).send(vessels);
        }
    );

    fastify.delete(
        '/:id',
        {
            schema: {
                summary: 'Delete vessel by id',
                tags: ['vessel'],
                params: Type.Object({
                    id: Type.String(),
                }),
            },
        },
        async (req, rep) => {
            await req.server.vesselsService.deleteVessel(req.params.id);
            rep.status(201).send();
        }
    );
};
