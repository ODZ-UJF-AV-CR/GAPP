import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Q_OptionalCallsign } from '../schemas';
import { B_Telemetry, B_TtnTelemetry } from '../schemas/telemetry.schema';
import { Type } from '@sinclair/typebox';
import { FastifySSEPlugin } from 'fastify-sse-v2';

export const telemetryController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'Endpoint for storing telemetry data',
                description: 'Received telemetry data are stored and forwarded to SondeHub.',
                body: B_Telemetry,
            },
        },
        async (req, rep) => {
            const vehicle = await req.server.vehicleService.getVehicleByBeaconCallsign(req.body.callsign);

            if (!vehicle) {
                return rep.unprocessableEntity(`Callsign ${req.body.callsign} does not exist`);
            }

            req.server.telemetryService.writeGeneralTelemetry(vehicle, req.body);
            rep.code(201).send();
        }
    );

    fastify.post(
        '/ttn',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'TTN webhook',
                description: 'Endpoint for receiving telemetry data from TheThingsNetwork. Data are stored in InfluxDB and forwarded to Sondehub.',
                body: B_TtnTelemetry,
                response: {
                    200: Type.String(),
                },
            },
        },
        async (req, rep) => {
            const vehicle = await req.server.vehicleService.getVehicleByBeaconCallsign(req.body.end_device_ids.device_id);

            if (!vehicle) {
                return rep.unprocessableEntity(`Callsign ${req.body.end_device_ids.device_id} does not exist`);
            }

            req.server.telemetryService.writeTtnTelemetry(vehicle, req.body);
            rep.code(200).send('OK');
        }
    );

    fastify.register(FastifySSEPlugin);

    fastify.get(
        '/stream',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'Get live data',
                description: 'Stream live data updates from vessels and chase cars using servewr sent events',
                querystring: Q_OptionalCallsign,
            },
        },
        async (req, res) => {
            const ac = req.server.getAbortController();
            req.raw.on('close', () => ac.abort());
            res.sse(req.server.telemetryService.streamGenerator(ac, req.query.callsign?.split(',')));
        }
    );
};
