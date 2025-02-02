import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { B_CarTelemetry, B_SondeTtnTelemetry } from '../schemas';
import { ttnPacketDto } from '../utils/ttn-packet-dto';
import { Type } from '@sinclair/typebox';

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

  fastify.get('/dashboard', {
    schema: {
      tags: ['telemetry'],
      summary: 'Get live data',
      description: 'Stream live data updates from vessels and chase cars using servewr sent events'
    }
  }, async (req, res) => {
    res.sse((async function* source() {
      let running = true;
      res.raw.on('close', () => {
        running = false;
      });
      while (running) {
        await new Promise((r) => setTimeout(r, 1000));
        const data = Date.now().toString();
        console.log('data: ', data);
        yield { data };
      }
    })()
    );
  });
};
