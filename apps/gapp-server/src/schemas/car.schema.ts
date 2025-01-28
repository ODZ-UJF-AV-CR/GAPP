import { Type as T } from '@sinclair/typebox';

export const B_Car = T.Object({
    callsign: T.String(),
    description: T.Optional(T.String()),
});

export const R_Car = T.Intersect([
    B_Car,
    T.Object({
        _id: T.String(),
    }),
]);
