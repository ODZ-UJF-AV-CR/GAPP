export abstract class AppError extends Error {
    abstract readonly statusCode: number;
}

export class NotFoundError extends AppError {
    public readonly statusCode = 404;
}

export class ConflictError extends AppError {
    public readonly statusCode = 409;
}

export class ValidationError extends AppError {
    public readonly statusCode = 422;
}

const PG_UNIQUE_VIOLATION = '23505';

export const isUniqueViolation = (e: unknown) => {
    return typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === PG_UNIQUE_VIOLATION;
};
