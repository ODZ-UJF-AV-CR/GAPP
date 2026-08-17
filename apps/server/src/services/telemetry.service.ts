import type { DashboardStream, GenericTelemetry } from '@gapp/shared';
import type { Uploader } from '@gapp/sondehub';
import type { Events } from '../plugins/event-bus.ts';
import { PointType, type TelemetryRepository } from '../repository/telemetry.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import { buildStream, type InitialDataCallback, type SubscribeCallback } from '../utils/build-stream.ts';
import type { Cache } from '../utils/cache.ts';
import { ValidationError } from '../utils/errors.ts';
import type { EventBus } from '../utils/event-bus.ts';
import type { TelemetryPacket } from '../utils/telemetry-packet.ts';

const callsignKey = (callsign: string) => `callsign.${callsign}`;
const vehicleKey = (name: string) => `vehicle.${name}`;

export class TelemetryService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly sondehub: Uploader,
        private readonly eventBus: EventBus<Events>,
        private readonly cache: Cache,
    ) {}

    public async writeTelemetry(packet: TelemetryPacket) {
        const callsign = packet.data.callsign;
        const uploadedBy = packet.options.uploader_callsign;

        const vehiclesQuery = [this.vehiclesRepository.getVehicleByBeaconCallsign(callsign)];
        uploadedBy && vehiclesQuery.push(this.vehiclesRepository.getVehicleByBeaconCallsign(uploadedBy));

        const [vehicle, uploaderVehicle] = await Promise.all(vehiclesQuery);

        if (!vehicle) {
            throw new ValidationError(`Callsign ${callsign} does not exist`);
        }

        if (uploadedBy && !uploaderVehicle) {
            throw new ValidationError(`Uploader ${uploadedBy} does not exist`);
        }

        if (uploadedBy && !uploaderVehicle?.is_station) {
            throw new ValidationError(`Uploader ${uploadedBy} is not a station`);
        }

        const isNewBeaconData = await this.isNewerData(callsignKey(callsign), packet.data._time);
        const isNewVehicleData = await this.isNewerData(vehicleKey(vehicle.name), packet.data._time);

        const uploadCallsigns = new Set<string>();
        vehicle.upload_aggregation && isNewVehicleData && uploadCallsigns.add(vehicle.name);
        vehicle.upload_beacons && isNewBeaconData && uploadCallsigns.add(callsign);

        for (const uploadCallsign of uploadCallsigns) {
            if (vehicle.is_station) {
                this.sondehub.uploadStationPosition(packet.sondehubStationPosition(uploadCallsign));
            } else {
                this.sondehub.addTelemetry(packet.sondehubPacket(uploadCallsign));
            }
        }

        const telemetry = { ...packet.data, uploader_callsign: uploadedBy };

        this.telemetryRepository.writeTelemetry(PointType.LOCATION, telemetry);

        if (isNewBeaconData) {
            this.eventBus.emit('telemetry.new', telemetry);
        }
    }

    private async isNewerData(key: string, time: string) {
        const previousTime = await this.cache.get<string>(key);

        if (previousTime && Date.parse(time) <= Date.parse(previousTime)) {
            return false;
        }

        await this.cache.set(key, time);
        return true;
    }

    public getDashboardStream(callsigns?: string[]) {
        const isWatched = (callsign?: string) => !!callsign && (!callsigns?.length || callsigns.includes(callsign));

        const initialData: InitialDataCallback<DashboardStream> = async () => {
            const [locations, contacts] = await Promise.all([
                this.telemetryRepository.getCallsignsLastLocation(callsigns),
                this.telemetryRepository.getUploadersLastContact(callsigns),
            ]);

            return {
                telemetry: locations.map(({ _time, callsign, uploader_callsign }) => ({ _time, callsign, uploader_callsign })),
                uploaderContact: contacts.map(({ _time, uploader_callsign }) => ({ _time, uploader_callsign })),
            };
        };

        const subscribe: SubscribeCallback<DashboardStream> = (push) => {
            const handler = ({ _time, callsign, uploader_callsign }: GenericTelemetry) => {
                const update: DashboardStream = {
                    telemetry: isWatched(callsign) ? [{ _time, callsign, uploader_callsign }] : [],
                    uploaderContact: isWatched(uploader_callsign) ? [{ _time, uploader_callsign: uploader_callsign as string }] : [],
                };

                if (update.telemetry.length || update.uploaderContact.length) {
                    push(update);
                }
            };

            this.eventBus.on('telemetry.new', handler);
            return () => this.eventBus.off('telemetry.new', handler);
        };

        return buildStream<DashboardStream>({ initialData, subscribe });
    }
}
