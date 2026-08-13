import { type Static, Type as T } from '@fastify/type-provider-typebox';
import { BeaconGetSchema } from './beacon.schema.js';

export const VehicleCreateSchema = T.Object(
    {
        name: T.String({ minLength: 1, maxLength: 32 }),
        description: T.Optional(T.String()),
        vehicle_type_id: T.Number(),
    },
    { additionalProperties: false },
);
export type VehicleCreate = Static<typeof VehicleCreateSchema>;

export const VehicleGetSchema = T.Object({
    id: T.Number(),
    name: T.String(),
    description: T.Optional(T.String()),
    vehicle_type_id: T.Number(),
    beacons: T.Optional(T.Array(T.Pick(BeaconGetSchema, ['id', 'callsign']))),
});
export type VehicleGet = Static<typeof VehicleGetSchema>;

export const VehicleUpdateSchema = T.Object(
    {
        description: T.Optional(T.String()),
    },
    { additionalProperties: false },
);
export type VehicleUpdate = Static<typeof VehicleUpdateSchema>;

export const VehiclesQuerySchema = T.Object({
    includeBeacons: T.Optional(T.Boolean({ default: false })),
});
export type VehiclesQuery = Static<typeof VehiclesQuerySchema>;

export const VehicleTypeGetSchema = T.Object({
    id: T.Number(),
    type_name: T.String(),
    is_station: T.Boolean(),
});
export type VehicleTypeGet = Static<typeof VehicleTypeGetSchema>;
