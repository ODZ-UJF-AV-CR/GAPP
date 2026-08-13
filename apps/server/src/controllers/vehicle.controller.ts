import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { VehicleCreateSchema, VehicleGetSchema, VehiclesQuerySchema, VehicleTypeGetSchema } from '@gapp/shared';

export const vehicleController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '',
        {
            schema: {
                tags: ['vehicle'],
                summary: 'Create a new vehicle',
                description: 'Creates new vehicle. Beacons are managed via the /beacons endpoints.',
                body: VehicleCreateSchema,
                response: {
                    201: VehicleGetSchema,
                },
            },
        },
        async (req, rep) => {
            try {
                const vehicle = await req.server.vehicleService.createVehicle(req.body);
                rep.status(201).send(vehicle);
            } catch (err) {
                const e = err as Error & { constraint?: string };
                if (e.constraint === 'vehicles_callsign_key') {
                    return rep.conflict(`Vehicle name ${req.body.name} already exists.`);
                }

                req.server.log.error(e, 'Error creating vehicle');
                return rep.internalServerError('Error creating vehicle');
            }
        },
    );

    fastify.get(
        '',
        {
            schema: {
                tags: ['vehicle'],
                summary: 'Get all vehicles',
                description: 'Returns all vehicles, with their beacons when includeBeacons is set.',
                querystring: VehiclesQuerySchema,
                response: {
                    200: Type.Array(VehicleGetSchema),
                },
            },
        },
        async (req, rep) => {
            try {
                const vehicles = await req.server.vehicleService.getVehicles(req.query.includeBeacons);
                rep.status(200).send(vehicles);
            } catch (e) {
                req.server.log.error(e, 'Error getting vehicles');
                return rep.internalServerError('Error getting vehicles');
            }
        },
    );

    fastify.get(
        '/types',
        {
            schema: {
                tags: ['vehicle'],
                summary: 'Get vehicle types',
                description: 'Returns all vehicle types.',
                response: {
                    200: Type.Array(VehicleTypeGetSchema),
                },
            },
        },
        async (req, rep) => {
            try {
                const types = await req.server.vehicleService.getVehicleTypes();
                rep.status(200).send(types);
            } catch (e) {
                req.server.log.error(e, 'Error getting vehicle types');
                return rep.internalServerError('Error getting vehicle types');
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
        },
        async (req, rep) => {
            try {
                await req.server.vehicleService.deleteVehicle(req.params.id);
                rep.status(204).send(null);
            } catch (e) {
                req.server.log.error(e, 'Error deleting vehicle');
                return rep.internalServerError('Error deleting vehicle');
            }
        },
    );
};
