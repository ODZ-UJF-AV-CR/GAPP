import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { GenericTelemetrySchema, OptionalCallsignQuery, TtnTelemetrySchema } from '@gapp/shared';
import { FastifySSEPlugin } from 'fastify-sse-v2';
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
            },
        },
        async (req, rep) => {
            try {
                await req.server.telemetryService.writeTelemetry(new TelemetryPacketGeneral(req.body), req.body.callsign);
                rep.code(201).send();
            } catch (e) {
                return rep.status(422).send(`Callsign ${req.body.callsign} does not exist`);
            }
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
                    422: Type.String(),
                },
            },
        },
        async (req, rep) => {
            try {
                await req.server.telemetryService.writeTelemetry(new TelemetryPacketFromTtn(req.body), req.body.end_device_ids.device_id);
                rep.code(200).send('OK');
            } catch (e) {
                return rep.status(422).send(`Callsign ${req.body.end_device_ids.device_id} does not exist`);
            }
        },
    );

    fastify.get(
        '',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'Get telemetry data',
                description: 'Retrieve telemetry data for a specific vehicle.',
                querystring: OptionalCallsignQuery,
                response: {
                    200: Type.Array(GenericTelemetrySchema),
                },
            },
        },
        async (req, rep) => {
            const callsigns = req.query.callsign?.split(',');
            const telemetry = await req.server.telemetryService.getCallsignsTelemetry(callsigns);
            rep.code(200).send(telemetry);
        },
    );

    fastify.register(FastifySSEPlugin);

    fastify.get(
        '/stream',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'Get live data',
                description:
                    'Stream live data updates from vessels and chase cars using server sent events. callsign query parameter can contain multiple callsigns separated by ",".',
                querystring: OptionalCallsignQuery,
            },
        },
        async (req, rep) => {
            const ac = req.server.getAbortController();
            req.raw.on('close', () => ac.abort());
            rep.sse(req.server.telemetryService.streamGenerator(ac, req.query.callsign?.split(',')));
        },
    );
};
