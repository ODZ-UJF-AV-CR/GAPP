import { type Static, Type as T } from '@fastify/type-provider-typebox';
import { VehicleType } from '../types/enums.ts';

const Vehicle = T.Object({
    callsign: T.String(),
    description: T.Optional(T.String()),
    type: T.Union([T.Literal(VehicleType.BALLOON), T.Literal(VehicleType.DRONE), T.Literal(VehicleType.CAR)]),
});

const Beacon = T.Object({
    callsign: T.String(),
});

export const B_CreateVehicle = T.Intersect([
    Vehicle,
    T.Object({
        beacons: T.Array(Beacon),
    }),
]);

export type CreateVehicle = Static<typeof B_CreateVehicle>;

export const R_Vehicle = T.Intersect([
    Vehicle,
    T.Object({
        id: T.Number(),
        beacons: T.Array(Beacon),
    }),
]);

export type VehicleWithBeacons = Static<typeof R_Vehicle>;

export const Q_OptionalCallsign = T.Object(
    {
        callsign: T.Optional(T.String()),
    },
    { nullable: true },
);
