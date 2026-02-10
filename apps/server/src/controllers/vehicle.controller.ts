import { Type } from '@sinclair/typebox';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { B_CreateVehicle, R_Vehicle } from '../schemas/vehicle.schema.ts';

export const vehicleController: FastifyPluginAsync = async (fastify: FastifyInstance) => {
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
        } as any,
        async (req: any, rep: any) => {
            try {
                const vehicle = await req.server.vehicleService.createVehicle(req.body);
                rep.status(201).send(vehicle);
            } catch (e: any) {
                if (e.constraint === 'vehicles_callsign_key') {
                    return (rep as any).conflict(`Vehicle callsign ${req.body.callsign} already exists.`);
                } else if (e.constraint === 'beacons_callsign_key') {
                    return (rep as any).conflict(`Beacon already exists.`);
                }

                req.server.log.error(e, 'Error creating vehicle');
                return (rep as any).internalServerError('Error creating vehicle');
            }
        },
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
        } as any,
        async (req: any, rep: any) => {
            try {
                const vehicles = await req.server.vehicleService.getVehicles();
                rep.status(200).send(vehicles);
            } catch (e: any) {
                req.server.log.error(e, 'Error getting vehicles');
                return (rep as any).internalServerError('Error getting vehicles');
            }
        },
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
        } as any,
        async (req: any, rep: any) => {
            try {
                await req.server.vehicleService.deleteVehicle(req.params.id);
                rep.status(204).send();
            } catch (e: any) {
                req.server.log.error(e, 'Error deleting vehicle');
                return (rep as any).internalServerError('Error deleting vehicle');
            }
        },
    );
};
