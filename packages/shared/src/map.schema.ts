import { type Static, Type as T } from '@fastify/type-provider-typebox';

export const MapDataSchema = T.Object({
    callsign: T.String(),
    _time: T.String({ format: 'date-time' }),
    latitude: T.Number({ minimum: -90, maximum: 90 }),
    longitude: T.Number({ minimum: -180, maximum: 180 }),
    altitude: T.Number(),
    uploader_callsign: T.Optional(T.String()),
});
export type MapData = Static<typeof MapDataSchema>;

export const MapStreamSchema = T.Object({
    telemetry: T.Array(MapDataSchema),
});
export type MapStream = Static<typeof MapStreamSchema>;

export const MapStreamQuerySchema = T.Object(
    {
        callsign: T.Optional(T.String()),
        hours: T.Optional(T.Integer({ minimum: 1, maximum: 168, default: 24 })),
    },
    { nullable: true },
);
export type MapStreamQuery = Static<typeof MapStreamQuerySchema>;
