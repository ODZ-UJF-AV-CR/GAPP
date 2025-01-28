import { Type as T } from '@sinclair/typebox';
import { VesselType } from '../services/vessels.service';

export const B_Vessel = T.Object({
    callsign: T.String(),
    description: T.Optional(T.String()),
    transmitters: T.Array(T.String()),
    type: T.Enum(VesselType),
});

export const R_Vessel = T.Intersect([
    B_Vessel,
    T.Object({
        _id: T.String(),
    }),
]);
