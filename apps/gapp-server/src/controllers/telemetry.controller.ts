import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_CarTelemetry, B_SondeTtnTelemetry } from '../schemas';
import { ttnPacketDto } from '../utils/ttn-packet-dto';

export const telemetryController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '/ttn',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'TTN webhook',
                description: 'Endpoint for receiving telemetry data from TheThingsNetwork. Data are stored in InfluxDB and forwarded to Sondehub.',
                body: B_SondeTtnTelemetry,
            },
        },
        async (req, rep) => {
            const telemetryPacket = ttnPacketDto(req.body);

            req.server.telemetryService.writeVesselLocation(telemetryPacket);
            req.server.sondehub.addTelemetry(telemetryPacket);

            rep.code(200).send('OK');
        }
    );

    fastify.post(
        '/car',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'Endpoint for car position',
                description: 'Received data are stored in InfluxDB and forwarded to SondeHub.',
                body: B_CarTelemetry,
            },
        },
        async (req, rep) => {
            req.server.telemetryService.writeCarLocation(req.body);

            await req.server.sondehub.uploadStationPosition({
                uploader_callsign: req.body.callsign,
                uploader_position: [req.body.latitude, req.body.longitude, req.body.altitude],
                mobile: true,
            });

            rep.code(201).send();
        }
    );
};
