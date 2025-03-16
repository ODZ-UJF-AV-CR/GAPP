import { EventBus } from '../utils/event-bus';
import { Events } from '../plugins/event-bus';
import { setInterval } from 'timers';
import { EventMessage } from 'fastify-sse-v2';
import { PointType, TelemetryRepository } from '../repository/telemetry.repository';
import { CallsignLocation, CarTelemetry, TtnTelemetry } from '../schemas';
import { TelemetryPacket, Uploader } from '@gapp/sondehub';
import { VehiclesRepository } from '../repository/vehicles.repository';
import { VehicleWithBeacons } from '../schemas/vehicle.schema';
import { ttnPacketDto } from '../utils/ttn-packet-dto';

export class TelemetryService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly sondehub: Uploader,
        private readonly eventBus: EventBus<Events>
    ) {}

    /** @deprecated */
    public writeVesselLocation(telemetry: TelemetryPacket) {
        console.log('Writing vessel location: ', telemetry);
    }

    /** @deprecated */
    public writeCarLocation(status: CarTelemetry) {
        console.log('Writing car location: ', status);
    }

    /** @deprecated */
    public async getCallsignsLastLocation(callsigns?: string[]): Promise<CallsignLocation[]> {
        console.log('Getting callsigns last location: ', callsigns);
        return [];
    }

    public async writeTtnTelemetry(vehicle: VehicleWithBeacons, telemetry: TtnTelemetry) {
        console.log('Writing TTN telemetry');

        const telemetryPacket = ttnPacketDto(telemetry);

        this.sondehub.addTelemetry(telemetryPacket);

        this.telemetryRepository.writeTelemetry(PointType.LOCATION, {
            timestamp: new Date(telemetryPacket.time_received),
            callsign: vehicle.callsign,
            latitude: telemetryPacket.lat,
            longitude: telemetryPacket.lon,
            altitude: telemetryPacket.alt,
        });
    }

    public async *streamGenerator(abortCotroller: AbortController, callsigns?: string[]): AsyncGenerator<EventMessage> {
        const abortSignal = abortCotroller.signal;
        const queue: EventMessage[] = [];
        const interval = setInterval(() => queue.push({ data: 'ping' }), 5_000);

        const eventHandler = async () => {
            const data = await this.telemetryRepository.getCallsignsLastLocation(callsigns);
            queue.push({ data: JSON.stringify(data) });
        };

        eventHandler();
        this.eventBus.on('influx.write', eventHandler);

        try {
            while (!abortSignal.aborted) {
                if (queue.length) {
                    yield queue.shift();
                } else {
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }
        } finally {
            if (interval) {
                clearInterval(interval);
            }

            this.eventBus.off('influx.write', eventHandler);
        }
    }
}
