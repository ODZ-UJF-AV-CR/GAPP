import { Type as T } from '@sinclair/typebox';

const Vehicle = T.Object({
    callsign: T.String(),
    description: T.Optional(T.String()),
    type: T.Number()
});

const Beacon = T.Object({
    callsign: T.String(),
});

export const B_CreateVehicle = T.Object({
    vehicle: Vehicle,
    beacons: T.Array(Beacon)
});

export const R_Vehicle = T.Intersect([
    Vehicle,
    T.Object({
        id: T.Number(),
        beacons: T.Array(Beacon)
    })
])
