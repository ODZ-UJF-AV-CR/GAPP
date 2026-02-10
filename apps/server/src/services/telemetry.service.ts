import type { Uploader } from '@gapp/sondehub';
import type { EventMessage } from 'fastify-sse-v2';
import { setInterval } from 'timers';
import type { Events } from '../plugins/event-bus.ts';
import type { Vehicle } from '../repository/postgres-database.ts';
import type { TelemetryData, TelemetryRepository } from '../repository/telemetry.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import type { TtnTelemetry } from '../schemas/telemetry.schema.ts';
import { PointType, VehicleType } from '../types/enums.ts';
import type { EventBus } from '../utils/event-bus.ts';
import { type TelemetryPacket, TelemetryPacketFromTtn, TelemetryPacketGeneral } from '../utils/telemetry-packet.ts';

export class TelemetryService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly sondehub: Uploader,
        private readonly eventBus: EventBus<Events>,
    ) {}

    public writeTtnTelemetry(vehicle: Vehicle, telemetry: TtnTelemetry) {
        const packet = new TelemetryPacketFromTtn(telemetry);
        this.writeTelemetry(vehicle.type, packet);
    }

    public writeGeneralTelemetry(vehicle: Vehicle, telemetry: TelemetryData) {
        const packet = new TelemetryPacketGeneral(telemetry);
        this.writeTelemetry(vehicle.type, packet);
    }

    public async getCallsignsTelemetry(callsigns?: string[]) {
        return await this.telemetryRepository.getCallsignsLastLocation(callsigns);
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

    private writeTelemetry(vehicleType: VehicleType, packet: TelemetryPacket) {
        if (vehicleType === VehicleType.CAR) {
            this.sondehub.uploadStationPosition(packet.sondehubStationPosition);
        } else {
            this.sondehub.addTelemetry(packet.sondehubPacket);
        }

        this.telemetryRepository.writeTelemetry(PointType.LOCATION, packet.data);
    }
}
