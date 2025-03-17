import { Static, Type as T } from '@sinclair/typebox';

/** @deprecated */
export const Q_Callsign = T.Object({
    callsign: T.String(),
});

/** @deprecated */
export const Q_OptionalCallsign = T.Object(
    {
        callsign: T.Optional(T.String()),
    },
    { nullable: true }
);

/** @deprecated */
export const B_CarTelemetry = T.Object({
    latitude: T.Number(),
    longitude: T.Number(),
    altitude: T.Number(),
    callsign: T.String(),
});
/** @deprecated */
export type CarTelemetry = Static<typeof B_CarTelemetry>;

/** @deprecated */
export const B_VesselTelemetry = T.Object({
    latitude: T.Number(),
    longitude: T.Number(),
    altitude: T.Number(),
    callsign: T.String(),
    received_at: T.String(),
    course: T.Optional(T.Number()),
    speed_mps: T.Optional(T.Number()),
});
/** @deprecated */
export type VesselTelemetry = Static<typeof B_VesselTelemetry>;

/** @deprecated */
export const R_CarsStatus = T.Array(
    T.Object({
        _time: T.String(),
        altitude: T.Number(),
        longitude: T.Number(),
        latitude: T.Number(),
        callsign: T.String(),
    })
);

/** @deprecated */
export type CarsStatus = Static<typeof R_CarsStatus>;

/** @deprecated */
export const R_CallsignLocation = T.Object({
    _time: T.String(),
    altitude: T.Number(),
    callsign: T.String(),
    latitude: T.Number(),
    longitude: T.Number(),
    result: T.String(),
    table: T.Number(),
});

/** @deprecated */
export type CallsignLocation = Static<typeof R_CallsignLocation>;
