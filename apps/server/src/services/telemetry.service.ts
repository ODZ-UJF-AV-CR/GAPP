import type { DashboardStream, TelemetryRecord } from '@gapp/shared';
import type { Uploader } from '@gapp/sondehub';
import type { FastifyBaseLogger } from 'fastify';
import type { Events } from '../plugins/event-bus.ts';
import { PointType, type TelemetryRepository } from '../repository/telemetry.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import { buildStream, type InitialDataCallback, type SubscribeCallback } from '../utils/build-stream.ts';
import type { Cache } from '../utils/cache.ts';
import { ValidationError } from '../utils/errors.ts';
import type { EventBus } from '../utils/event-bus.ts';
import type { TelemetryPacket } from '../utils/telemetry-packet.ts';

const callsignKey = (callsign: string) => `callsign.${callsign}`;

/** @description Receiver clocks drifting beyond this are reported, such packets stay invisible on the dashboard until real time catches up */
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

/** @description Beacons silent for this long are dropped from the cache, the dashboard guards against a stale packet being re-emitted */
const LAST_PACKET_TTL_MS = 12 * 60 * 60 * 1000;

export class TelemetryService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly sondehub: Uploader,
        private readonly eventBus: EventBus<Events>,
        private readonly cache: Cache,
        private readonly logger: FastifyBaseLogger,
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

        this.warnOnClockSkew(vehicle.name, callsign, packet.data._time);

        // uploaded unconditionally, ground stations may backfill old packets after being offline
        const uploadCallsigns = new Set<string>();
        vehicle.upload_aggregation && uploadCallsigns.add(vehicle.name);
        vehicle.upload_beacons && uploadCallsigns.add(callsign);

        for (const uploadCallsign of uploadCallsigns) {
            if (vehicle.is_station) {
                this.sondehub.uploadStationPosition(packet.sondehubStationPosition(uploadCallsign));
            } else {
                this.sondehub.addTelemetry(packet.sondehubPacket(uploadCallsign));
            }
        }

        const telemetry: TelemetryRecord = { ...packet.data, uploader_callsign: uploadedBy };

        this.telemetryRepository.writeTelemetry(PointType.LOCATION, telemetry);

        // the live dashboard only shows the newest position, backfilled packets must not overwrite it
        if (await this.isNewestPacket(callsign, packet.data._time)) {
            this.eventBus.emit('telemetry.new', telemetry);
        }
    }

    /** @description Future timestamps mean a misconfigured receiver clock, the packet is still stored so nothing is lost */
    private warnOnClockSkew(vehicleName: string, beaconCallsign: string, time: string) {
        const skewMs = Date.parse(time) - Date.now();

        if (skewMs <= MAX_CLOCK_SKEW_MS) {
            return;
        }

        this.logger.warn(
            { vehicle: vehicleName, beacon: beaconCallsign, packetTime: time, secondsAhead: Math.round(skewMs / 1000) },
            `Telemetry from beacon ${beaconCallsign} (vehicle ${vehicleName}) is ${Math.round(skewMs / 1000)}s in the future, check the receiver clock`,
        );
    }

    private async isNewestPacket(callsign: string, time: string) {
        const previousTime = await this.cache.get<string>(callsignKey(callsign));

        if (previousTime && Date.parse(time) <= Date.parse(previousTime)) {
            return false;
        }

        await this.cache.set(callsignKey(callsign), time, LAST_PACKET_TTL_MS);
        return true;
    }

    public getDashboardStream(callsigns?: string[]) {
        const isWatched = (callsign?: string) => !!callsign && (!callsigns?.length || callsigns.includes(callsign));

        // headers are already sent when this runs, so a failed snapshot must not reject the stream
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
                this.logger.error(e, 'Failed to load the initial dashboard snapshot, streaming live updates only');
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
}
