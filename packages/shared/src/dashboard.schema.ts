import { type Static, Type as T } from '@fastify/type-provider-typebox';

export const DashboardStreamSchema = T.Object({
    telemetry: T.Array(
        T.Object({
            _time: T.String({ format: 'date-time' }),
            callsign: T.String(),
            uploader_callsign: T.Optional(T.String()),
        }),
    ),
    uploaderContact: T.Array(
        T.Object({
            _time: T.String({ format: 'date-time' }),
            uploader_callsign: T.String(),
        }),
    ),
});
export type DashboardStream = Static<typeof DashboardStreamSchema>;
