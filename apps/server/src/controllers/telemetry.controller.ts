import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { GenericTelemetrySchema, OptionalTelemetryUploaderSchema, TtnTelemetrySchema } from '@gapp/shared';
import { TelemetryPacketFromTtn, TelemetryPacketGeneral } from '../utils/telemetry-packet.ts';

export const telemetryController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'Endpoint for storing telemetry data',
                description: 'Received telemetry data are stored and forwarded to SondeHub.',
                body: GenericTelemetrySchema,
                querystring: OptionalTelemetryUploaderSchema,
            },
        },
        async (req, rep) => {
            await req.server.telemetryService.writeTelemetry(new TelemetryPacketGeneral(req.body, { uploader_callsign: req.query.uploaded_by }));
            rep.code(201).send();
        },
    );

    fastify.post(
        '/ttn',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'TTN webhook',
                description: 'Endpoint for receiving telemetry data from TheThingsNetwork. Data are stored in InfluxDB and forwarded to Sondehub.',
                body: TtnTelemetrySchema,
                response: {
                    200: Type.String(),
                },
            },
        },
        async (req, rep) => {
            await req.server.telemetryService.writeTelemetry(new TelemetryPacketFromTtn(req.body));
            rep.code(200).send('OK');
        },
    );
};
