import { type Static, Type as T } from '@fastify/type-provider-typebox';

export const VehicleCreateSchema = T.Object({
    name: T.String(),
    description: T.Optional(T.String()),
    vehicle_type_id: T.Number(),
    beacons: T.Array(
        T.Object({
            callsign: T.String(),
        }),
    ),
});
export type VehicleCreate = Static<typeof VehicleCreateSchema>;

export const VehicleGetSchema = T.Intersect([
    VehicleCreateSchema,
    T.Object({
        id: T.Number(),
    }),
]);
export type VehicleGet = Static<typeof VehicleGetSchema>;

export const VehicleTypeGetSchema = T.Object({
    id: T.Number(),
    type_name: T.String(),
    is_station: T.Boolean(),
});
export type VehicleTypeGet = Static<typeof VehicleTypeGetSchema>;
