import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_Car } from '../schemas/car.schema';
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
                req.server.log.info(car, 'Created new car');
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
                    200: Type.Array(B_Car),
                },
            },
        },
        async (req, rep) => {
            const cars = await req.server.carsService.getCars();

            rep.status(200).send(cars);
        }
    );
};
