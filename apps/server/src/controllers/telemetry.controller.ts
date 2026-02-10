import { Type } from '@sinclair/typebox';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { FastifySSEPlugin } from 'fastify-sse-v2';
import { B_Telemetry, B_TtnTelemetry, R_Telemetry } from '../schemas/telemetry.schema.ts';
import { Q_OptionalCallsign } from '../schemas/vehicle.schema.ts';

export const telemetryController: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.post(
        '',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'Endpoint for storing telemetry data',
                description: 'Received telemetry data are stored and forwarded to SondeHub.',
                body: B_Telemetry,
            },
        } as any,
        async (req: any, rep: any) => {
            const vehicle = await req.server.vehicleService.getVehicleByBeaconCallsign(req.body.callsign);

            if (!vehicle) {
                return rep.status(422).send(`Callsign ${req.body.callsign} does not exist`);
            }

            req.server.telemetryService.writeGeneralTelemetry(vehicle, req.body);
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
                body: B_TtnTelemetry,
                response: {
                    200: Type.String(),
                },
            },
        } as any,
        async (req: any, rep: any) => {
            const vehicle = await req.server.vehicleService.getVehicleByBeaconCallsign(req.body.end_device_ids.device_id);

            if (!vehicle) {
                return rep.status(422).send(`Callsign ${req.body.end_device_ids.device_id} does not exist`);
            }

            req.server.telemetryService.writeTtnTelemetry(vehicle, req.body);
            rep.code(200).send('OK');
        },
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
        } as any,
        async (req: any, rep: any) => {
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
                description: 'Stream live data updates from vessels and chase cars using server sent events',
                querystring: Q_OptionalCallsign,
            },
        } as any,
        async (req: any, rep: any) => {
            const ac = (req.server as any).getAbortController();
            req.raw.on('close', () => ac.abort());
            rep.sse((req.server as any).telemetryService.streamGenerator(ac, req.query.callsign?.split(',')));
        },
    );
};
