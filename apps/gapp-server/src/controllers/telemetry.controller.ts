import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_Telemetry, B_TtnTelemetry, R_Telemetry } from '../schemas/telemetry.schema';
import { Type } from '@sinclair/typebox';
import { FastifySSEPlugin } from 'fastify-sse-v2';
import { Q_OptionalCallsign } from '../schemas/vehicle.schema';

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

    fastify.get(
        '',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'Get telemetry data',
                description: 'Retrieve telemetry data for a specific vehicle.',
                querystring: Q_OptionalCallsign,
                response: {
                    200: Type.Array(R_Telemetry),
                },
            },
        },
        async (req, rep) => {
            const callsigns = req.query.callsign?.split(',');
            const telemetry = await req.server.telemetryService.getCallsignsTelemetry(callsigns);
            rep.code(200).send(telemetry);
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
        async (req, rep) => {
            const ac = req.server.getAbortController();
            req.raw.on('close', () => ac.abort());
            rep.sse(req.server.telemetryService.streamGenerator(ac, req.query.callsign?.split(',')));
        }
    );
};
