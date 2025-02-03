import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_CarTelemetry, B_SondeTtnTelemetry, Q_OptionalCallsign } from '../schemas';
import { ttnPacketDto } from '../utils/ttn-packet-dto';
import { Type } from '@sinclair/typebox';
import { FastifySSEPlugin } from 'fastify-sse-v2';

export const telemetryController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '/ttn',
        {
            schema: {
                tags: ['telemetry'],
                summary: 'TTN webhook',
                description: 'Endpoint for receiving telemetry data from TheThingsNetwork. Data are stored in InfluxDB and forwarded to Sondehub.',
                body: B_SondeTtnTelemetry,
                response: {
                    200: Type.String(),
                },
            },
        },
        async (req, rep) => {
            const telemetryPacket = ttnPacketDto(req.body);

            if (!(await req.server.vesselsService.ensureCallsign(telemetryPacket.payload_callsign))) {
                return rep.unprocessableEntity(`Callsign ${telemetryPacket.payload_callsign} does not exist`);
            }

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
            if (!(await req.server.carsService.ensureCallsign(req.body.callsign))) {
                return rep.unprocessableEntity(`Callsign ${req.body.callsign} does not exist`);
            }

            req.server.telemetryService.writeCarLocation(req.body);

            await req.server.sondehub.uploadStationPosition({
                uploader_callsign: req.body.callsign,
                uploader_position: [req.body.latitude, req.body.longitude, req.body.altitude],
                mobile: true,
            });

            rep.code(201).send();
        }
    );

  fastify.get('', {
    schema: {
      tags: ['telemetry'],
      summary: 'Get telemetry data',
      description: 'Get latest telemetry data for all callsigns or you can specify callsigns in query parameter',
      querystring: Q_OptionalCallsign
    }
  }, async (req, res) => {
    const callsigns = req.query?.callsign?.split(',');
    const latestData = await req.server.telemetryService.getCallsignsLastLocation(callsigns);
    res.status(200).send(latestData);
  });


    fastify.register(FastifySSEPlugin);

  fastify.get('/dashboard', {
    schema: {
      tags: ['telemetry'],
      summary: 'Get live data',
      description: 'Stream live data updates from vessels and chase cars using servewr sent events'
    }
  }, async (req, res) => {
    let streaming = true;
    req.raw.on('close', () => streaming = false);
    res.sse(
      (async function* () {
        for await (const [event] of req.server.telemetryService.getStreamGenerator()) {
          if(!streaming) {
            break;
          }
          yield event;
        }
      })()
    );
  });
};
