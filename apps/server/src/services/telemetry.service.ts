import { setInterval } from 'node:timers';
import type { Uploader } from '@gapp/sondehub';
import type { EventMessage } from 'fastify-sse-v2';
import type { Events } from '../plugins/event-bus.ts';
import { PointType, type TelemetryRepository } from '../repository/telemetry.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import type { EventBus } from '../utils/event-bus.ts';
import type { TelemetryPacket } from '../utils/telemetry-packet.ts';

export class TelemetryService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly sondehub: Uploader,
        private readonly eventBus: EventBus<Events>,
    ) {}

    public async writeTelemetry(packet: TelemetryPacket, callsign: string) {
        const vehicle = await this.vehiclesRepository.getVehicleByBeaconCallsign(callsign);

        if (!vehicle) {
            throw new Error(`Callsign ${callsign} does not exist`);
        }

        if (vehicle.is_station) {
            this.sondehub.uploadStationPosition(packet.sondehubStationPosition);
        } else {
            this.sondehub.addTelemetry(packet.sondehubPacket);
        }

        this.telemetryRepository.writeTelemetry(PointType.LOCATION, packet.data);
    }

    public async getCallsignsTelemetry(callsigns?: string[]) {
        return await this.telemetryRepository.getCallsignsLastLocation(callsigns);
    }

    public async *streamGenerator(abortCotroller: AbortController, callsigns?: string[]): AsyncGenerator<EventMessage> {
        const abortSignal = abortCotroller.signal;
        const queue: EventMessage[] = [];
        const interval = setInterval(() => queue.push({ data: JSON.stringify({ data: 'ping' }) }), 5_000);

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
