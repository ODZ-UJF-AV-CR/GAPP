import { Static, Type as T } from '@sinclair/typebox';
import { VehicleType } from '../repository/postgres-database';

const Vehicle = T.Object({
    callsign: T.String(),
    description: T.Optional(T.String()),
    type: T.Enum(VehicleType),
});

const Beacon = T.Object({
    callsign: T.String(),
});

export const B_CreateVehicle = T.Object({
    vehicle: Vehicle,
    beacons: T.Array(Beacon),
});

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
    { nullable: true }
);
