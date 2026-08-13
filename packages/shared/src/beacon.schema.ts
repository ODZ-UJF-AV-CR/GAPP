import { type Static, Type as T } from '@fastify/type-provider-typebox';

export const BeaconCreateSchema = T.Object(
    {
        callsign: T.String({ minLength: 1, maxLength: 32 }),
        vehicle_id: T.Number(),
    },
    { additionalProperties: false },
);
export type BeaconCreate = Static<typeof BeaconCreateSchema>;

export const BeaconsCreateSchema = T.Array(BeaconCreateSchema, { minItems: 1 });
export type BeaconsCreate = Static<typeof BeaconsCreateSchema>;

export const BeaconGetSchema = T.Object({
    id: T.Number(),
    callsign: T.String(),
    vehicle_id: T.Number(),
});
export type BeaconGet = Static<typeof BeaconGetSchema>;

export const BeaconsQuerySchema = T.Object({
    vehicle_id: T.Optional(T.Number()),
});
export type BeaconsQuery = Static<typeof BeaconsQuerySchema>;
