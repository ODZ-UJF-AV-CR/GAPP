import { setInterval } from 'node:timers';
import type { TelemetryGet } from '@gapp/shared';
import type { Uploader } from '@gapp/sondehub';
import type { EventMessage } from 'fastify-sse-v2';
import type { Events } from '../plugins/event-bus.ts';
import { PointType, type TelemetryRepository } from '../repository/telemetry.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import type { Cache } from '../utils/cache.ts';
import type { EventBus } from '../utils/event-bus.ts';
import type { TelemetryPacket } from '../utils/telemetry-packet.ts';

const callsignKey = (callsign: string) => `callsign.${callsign}`;

export class TelemetryService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly sondehub: Uploader,
        private readonly eventBus: EventBus<Events>,
        private readonly cache: Cache,
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

        const previousTime = await this.cache.get<string>(callsignKey(callsign));

        if (!previousTime || packet.data.timestamp > previousTime) {
            const _time = packet.data.timestamp;
            delete packet.data.timestamp;
            this.eventBus.emit('telemetry.new', {
                ...packet.data,
                _time,
            });
            this.cache.set(callsignKey(callsign), packet.data.timestamp);
        }
    }

    public async getCallsignsTelemetry(callsigns?: string[]) {
        return await this.telemetryRepository.getCallsignsLastLocation(callsigns);
    }

    public async *streamGenerator(abortCotroller: AbortController, callsigns?: string[]): AsyncGenerator<EventMessage> {
        const abortSignal = abortCotroller.signal;
        const queue: EventMessage[] = [];
        const interval = setInterval(() => queue.push({ data: '{"data":"ping"}' }), 5_000);

        const data = await this.telemetryRepository.getCallsignsLastLocation(callsigns);
        queue.push({ data: JSON.stringify(data) });

        const newDataHandler = (data: TelemetryGet) => {
            if (!callsigns || callsigns.includes(data.callsign)) {
                queue.push({ data: JSON.stringify(data) });
            }
        };

        this.eventBus.on('telemetry.new', newDataHandler);

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

            this.eventBus.off('telemetry.new', newDataHandler);
        }
    }
}
