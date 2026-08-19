import type { DashboardStream, TelemetryRecord, VehicleTelemetryStream } from '@gapp/shared';
import type { FastifyBaseLogger } from 'fastify';
import type { Events } from '../plugins/event-bus.ts';
import type { TelemetryRepository } from '../repository/telemetry.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import { buildStream, type InitialDataCallback, type SubscribeCallback } from '../utils/build-stream.ts';
import { NotFoundError } from '../utils/errors.ts';
import type { EventBus } from '../utils/event-bus.ts';

export class LiveDataService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly eventBus: EventBus<Events>,
        private readonly logger: FastifyBaseLogger,
    ) {}

    public getDashboardStream(callsigns?: string[]) {
        const isWatched = (callsign?: string) => !!callsign && (!callsigns?.length || callsigns.includes(callsign));

        const initialData: InitialDataCallback<DashboardStream> = async () => {
            try {
                const [locations, contacts] = await Promise.all([
                    this.telemetryRepository.getCallsignsLastLocation(callsigns),
                    this.telemetryRepository.getUploadersLastContact(callsigns),
                ]);

                return {
                    telemetry: locations.map(({ _time, callsign, uploader_callsign }) => ({ _time, callsign, uploader_callsign })),
                    uploaderContact: contacts.map(({ _time, uploader_callsign }) => ({ _time, uploader_callsign })),
                };
            } catch (e) {
                this.logger.error(e, 'Failed to load initial dashboard snapshot');
                return { telemetry: [], uploaderContact: [] };
            }
        };

        const subscribe: SubscribeCallback<DashboardStream> = (push) => {
            const handler = ({ _time, callsign, uploader_callsign }: TelemetryRecord) => {
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

    public async getVehicleTelemetryStream(vehicleId: number) {
        const vehicle = await this.vehiclesRepository.getVehicleById(vehicleId, true);

        if (!vehicle) {
            throw new NotFoundError(`Vehicle with id ${vehicleId} does not exist.`);
        }

        const callsigns = vehicle.beacons?.map((beacon) => beacon.callsign) ?? [];
        const isWatched = (callsign: string) => callsigns.includes(callsign);

        const initialData: InitialDataCallback<VehicleTelemetryStream> = async () => {
            if (!callsigns.length) {
                return { telemetry: [] };
            }

            try {
                const telemetry = await this.telemetryRepository.getVehicleTelemetry(callsigns);
                return { telemetry };
            } catch (e) {
                this.logger.error(e, `Failed initial telemetry snapshot for vehicle ${vehicleId}`);
                return { telemetry: [] };
            }
        };

        const subscribe: SubscribeCallback<VehicleTelemetryStream> = (push) => {
            const handler = (record: TelemetryRecord) => {
                if (isWatched(record.callsign)) {
                    push({ telemetry: [record] });
                }
            };

            this.eventBus.on('telemetry.new', handler);
            return () => this.eventBus.off('telemetry.new', handler);
        };

        return buildStream<VehicleTelemetryStream>({ initialData, subscribe });
    }
}
