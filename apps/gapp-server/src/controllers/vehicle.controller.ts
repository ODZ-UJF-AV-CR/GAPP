import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_CreateVehicle, R_Vehicle } from '../schemas/vehicle.schema';
import { Type } from '@sinclair/typebox';

export const vehicleController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '',
        {
            schema: {
                tags: ['vehicle'],
                summary: 'Create a new vehicle',
                description: 'Creates new vehicle with associated beacons.',
                body: B_CreateVehicle,
                response: {
                    201: R_Vehicle,
                },
            },
        },
        async (req, rep) => {
            try {
                const vehicle = await req.server.vehicleService.createVehicle(req.body);
                rep.status(201).send(vehicle);
            } catch (e) {
                if (e.constraint === 'vehicles_callsign_key') {
                    return rep.conflict(`Vehicle callsign ${req.body.vehicle.callsign} already exists.`);
                } else if (e.constraint === 'beacons_callsign_key') {
                    return rep.conflict(`Vehicle beacon already exists.`);
                }

                req.server.log.error(e, 'Error creating vehicle');
                return rep.internalServerError('Error creating vehicle');
            }
        }
    );

    fastify.get(
        '',
        {
            schema: {
                tags: ['vehicle'],
                summary: 'Get all vehicles',
                description: 'Returns all vehicles with list of its beacons.',
                response: {
                    200: Type.Array(R_Vehicle),
                },
            },
        },
        async (req, rep) => {
            try {
                const vehicles = await req.server.vehicleService.getVehicles();
                rep.status(200).send(vehicles);
            } catch (e) {
                req.server.log.error(e, 'Error getting vehicles');
                return rep.internalServerError('Error getting vehicles');
            }
        }
    );

    fastify.delete(
        '/:id',
        {
            schema: {
                tags: ['vehicle'],
                summary: 'Delete vehicle',
                description: 'Deletes vehicle with given id.',
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
                await req.server.vehicleService.deleteVehicle(req.params.id);
                rep.status(204).send();
            } catch (e) {
                req.server.log.error(e, 'Error deleting vehicle');
                return rep.internalServerError('Error deleting vehicle');
            }
        }
    );
};
