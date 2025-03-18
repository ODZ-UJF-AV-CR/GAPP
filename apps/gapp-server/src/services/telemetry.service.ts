import { EventBus } from '../utils/event-bus';
import { Events } from '../plugins/event-bus';
import { setInterval } from 'timers';
import { EventMessage } from 'fastify-sse-v2';
import { PointType, TelemetryData, TelemetryRepository } from '../repository/telemetry.repository';
import { TtnTelemetry } from '../schemas/telemetry.schema';
import { Uploader } from '@gapp/sondehub';
import { VehiclesRepository } from '../repository/vehicles.repository';
import { TelemetryPacket, TelemetryPacketFromTtn, TelemetryPacketGeneral } from '../utils/telemetry-packet';
import { Vehicle, VehicleType } from '../repository/postgres-database';

export class TelemetryService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly sondehub: Uploader,
        private readonly eventBus: EventBus<Events>
    ) {}

    public writeTtnTelemetry(vehicle: Vehicle, telemetry: TtnTelemetry) {
        const packet = new TelemetryPacketFromTtn(telemetry);
        this.writeTelemetry(vehicle.type, packet);
    }

    public writeGeneralTelemetry(vehicle: Vehicle, telemetry: TelemetryData) {
        const packet = new TelemetryPacketGeneral(telemetry);
        this.writeTelemetry(vehicle.type, packet);
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
