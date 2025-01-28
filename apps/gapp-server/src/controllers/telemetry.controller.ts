import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_CarStatus, B_SondeTtnTelemetry, Q_Callsign } from '../schemas';
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
                querystring: Q_Callsign,
                body: B_CarStatus,
            },
        },
        async (req, rep) => {
            const { callsign } = req.query;
            const { latitude, longitude, altitude } = req.body;

            req.server.telemetryService.writeCarLocation(callsign, {
                latitude,
                longitude,
                altitude,
            });

            await req.server.sondehub.uploadStationPosition({
                uploader_callsign: callsign,
                uploader_position: [latitude, longitude, altitude],
                mobile: true,
            });

            rep.code(201).send();
        }
    );
};
