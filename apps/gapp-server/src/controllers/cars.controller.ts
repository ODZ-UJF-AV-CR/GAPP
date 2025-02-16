import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_Car, R_Car } from '../schemas/car.schema';
import { Type } from '@sinclair/typebox';

export const carsController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '',
        {
            schema: {
                summary: 'Adds new chase car',
                description: 'Creates new car with unique callsign.',
                tags: ['cars'],
                body: B_Car,
                response: {
                    200: B_Car,
                },
            },
        },
        async (req, rep) => {
            try {
                const inserted = await req.server.carsService.addCar(req.body);
                const car = {
                    ...req.body,
                    _id: inserted.insertedId.toString(),
                };
                req.server.log.debug(car, 'Created new car');
                return rep.status(200).send(req.body);
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
                summary: 'Geat all cars list',
                description: 'Get all cars from database with latest location data',
                tags: ['cars'],
                response: {
                    200: Type.Array(R_Car),
                },
            },
        },
        async (req, rep) => {
            const cars = await req.server.carsService.getCars();

            rep.status(200).send(cars);
        }
    );

    fastify.delete(
        '/:id',
        {
            schema: {
                summary: 'Delete chase car by id',
                tags: ['cars'],
                params: Type.Object({
                    id: Type.String(),
                }),
            },
        },
        async (req, rep) => {
            await req.server.carsService.deleteCar(req.params.id);
            rep.status(201).send();
        }
    );
};
