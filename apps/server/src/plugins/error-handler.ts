import { STATUS_CODES } from 'node:http';
import type { FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import { AppError, isUniqueViolation } from '../utils/errors.ts';
import { Plugins } from './plugins.ts';

export default fp(
    async (fastify) => {
        fastify.setErrorHandler((error, req, rep) => {
            if (error instanceof AppError) {
                return rep.status(error.statusCode).send({
                    statusCode: error.statusCode,
                    error: STATUS_CODES[error.statusCode],
                    message: error.message,
                });
            }

            if (isUniqueViolation(error)) {
                req.log.warn(error, 'Unique constraint violation');
                return rep.conflict('Resource already exists.');
            }

            // fastify validation errors and http-errors from @fastify/sensible already carry a client status code
            const fastifyError = error as FastifyError;
            if (fastifyError.statusCode && fastifyError.statusCode < 500) {
                return rep.send(fastifyError);
            }

            req.log.error(error, 'Unhandled request error');
            return rep.internalServerError();
        });
    },
    {
        name: Plugins.ERROR_HANDLER,
    },
);
