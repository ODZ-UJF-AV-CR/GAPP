import { type Static, Type as T } from '@fastify/type-provider-typebox';

export const OptionalCallsignQuery = T.Object(
    {
        callsign: T.Optional(T.String()),
    },
    { nullable: true },
);
export type OptionalCallsignQuery = Static<typeof OptionalCallsignQuery>;
