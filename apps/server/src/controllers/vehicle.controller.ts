import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { VehicleCreateSchema, VehicleGetSchema, VehiclesQuerySchema, VehicleTypeGetSchema, VehicleUpdateSchema } from '@gapp/shared';

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
            const vehicle = await req.server.vehicleService.createVehicle(req.body);
            rep.status(201).send(vehicle);
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
            const vehicles = await req.server.vehicleService.getVehicles(req.query.includeBeacons);
            rep.status(200).send(vehicles);
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
            const types = await req.server.vehicleService.getVehicleTypes();
            rep.status(200).send(types);
        },
    );

    fastify.get(
        '/:id',
        {
            schema: {
                tags: ['vehicle'],
                summary: 'Get vehicle detail',
                description: 'Returns vehicle with given id, with its beacons when includeBeacons is set.',
                params: Type.Object({
                    id: Type.Number(),
                }),
                querystring: VehiclesQuerySchema,
                response: {
                    200: VehicleGetSchema,
                },
            },
        },
        async (req, rep) => {
            const vehicle = await req.server.vehicleService.getVehicleById(req.params.id, req.query.includeBeacons);
            rep.status(200).send(vehicle);
        },
    );

    fastify.patch(
        '/:id',
        {
            schema: {
                tags: ['vehicle'],
                summary: 'Update vehicle',
                description: 'Updates editable fields of the vehicle with given id.',
                params: Type.Object({
                    id: Type.Number(),
                }),
                body: VehicleUpdateSchema,
                response: {
                    200: VehicleGetSchema,
                },
            },
        },
        async (req, rep) => {
            const vehicle = await req.server.vehicleService.updateVehicle(req.params.id, req.body);
            rep.status(200).send(vehicle);
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
            await req.server.vehicleService.deleteVehicle(req.params.id);
            rep.status(204).send(null);
        },
    );
};
