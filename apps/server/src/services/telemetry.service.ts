import type { GenericTelemetry } from '@gapp/shared';
import type { Uploader } from '@gapp/sondehub';
import type { Events } from '../plugins/event-bus.ts';
import { PointType, type TelemetryRepository } from '../repository/telemetry.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import { buildStream } from '../utils/build-stream.ts';
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

    public async writeTelemetry(packet: TelemetryPacket, uploadedBy?: string) {
        const callsign = packet.data.callsign;

        const vehiclesQuery = [this.vehiclesRepository.getVehicleByBeaconCallsign(callsign)];
        uploadedBy && vehiclesQuery.push(this.vehiclesRepository.getVehicleByBeaconCallsign(uploadedBy));

        const [vehicle, uploaderVehicle] = await Promise.all(vehiclesQuery);

        if (!vehicle) {
            throw new Error(`Callsign ${callsign} does not exist`);
        }

        if (uploadedBy && !uploaderVehicle) {
            throw new Error(`Uploader ${uploadedBy} does not exist`);
        }

        if (uploadedBy && !uploaderVehicle?.is_station) {
            throw new Error(`Uploader ${uploadedBy} is not a station`);
        }

        if (vehicle.is_station) {
            this.sondehub.uploadStationPosition(packet.sondehubStationPosition);
        } else {
            this.sondehub.addTelemetry(packet.sondehubPacket);
        }

        this.telemetryRepository.writeTelemetry(PointType.LOCATION, packet.data);

        const previousTime = await this.cache.get<string>(callsignKey(callsign));

        if (!previousTime || packet.data._time > previousTime) {
            this.eventBus.emit('telemetry.new', packet.data);
            this.cache.set(callsignKey(callsign), packet.data._time);
        }
    }

    public async getCallsignsTelemetry(callsigns?: string[]) {
        return await this.telemetryRepository.getCallsignsLastLocation(callsigns);
    }

    public getTelemetryStream(callsigns?: string[]) {
        return buildStream<GenericTelemetry>({
            initialData: () => this.telemetryRepository.getCallsignsLastLocation(callsigns),
            subscribe: (push) => {
                const handler = (data: GenericTelemetry) => {
                    if (!callsigns || callsigns.includes(data.callsign)) {
                        push(data);
                    }
                };

                this.eventBus.on('telemetry.new', handler);
                return () => this.eventBus.off('telemetry.new', handler);
            },
        });
    }
}
