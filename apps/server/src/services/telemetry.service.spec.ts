import type { GenericTelemetry } from '@gapp/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PointType } from '../repository/telemetry.repository.ts';
import { InMemoryCache } from '../utils/cache.ts';
import { ValidationError } from '../utils/errors.ts';
import { EventBus } from '../utils/event-bus.ts';
import { TelemetryService } from './telemetry.service.ts';

const UPLOADER_CALLSIGNS = { defaultUploaderCallsign: 'GAPP-Server', ttnUploaderCallsign: 'TTN_Gateway' };

const vehicle = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    name: 'balloon',
    description: null,
    is_station: false,
    type_name: 'balloon',
    upload_aggregation: true,
    upload_beacons: false,
    ...overrides,
});

const packet = (overrides: Partial<GenericTelemetry> = {}): GenericTelemetry => ({
    callsign: 'balloon',
    latitude: 50,
    longitude: 14,
    altitude: 1000,
    _time: new Date().toISOString(),
    ...overrides,
});

const createService = (vehiclesByCallsign: Record<string, ReturnType<typeof vehicle> | undefined>) => {
    const telemetryRepository = { writeTelemetry: vi.fn() };
    const vehiclesRepository = { getVehicleByBeaconCallsign: vi.fn(async (callsign: string) => vehiclesByCallsign[callsign]) };
    const sondehub = { addTelemetry: vi.fn(), uploadStationPosition: vi.fn() };
    const logger = { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const eventBus = new EventBus<{ 'telemetry.new': [unknown] }>();
    const emitted: unknown[] = [];
    eventBus.on('telemetry.new', (data) => emitted.push(data));

    const service = new TelemetryService(
        telemetryRepository as never,
        vehiclesRepository as never,
        sondehub as never,
        eventBus as never,
        new InMemoryCache(),
        logger as never,
        UPLOADER_CALLSIGNS,
    );

    return { service, telemetryRepository, vehiclesRepository, sondehub, logger, emitted };
};

describe('TelemetryService', () => {
    beforeEach(() => vi.useRealTimers());

    describe('validation', () => {
        it('rejects an unknown callsign', async () => {
            const { service } = createService({});

            await expect(service.writeGenericTelemetry(packet())).rejects.toBeInstanceOf(ValidationError);
        });

        it('rejects an unknown uploader', async () => {
            const { service } = createService({ balloon: vehicle() });

            await expect(service.writeGenericTelemetry(packet(), { uploaded_by: 'ghost' })).rejects.toBeInstanceOf(ValidationError);
        });

        it('rejects an uploader that is not a station', async () => {
            const { service } = createService({ balloon: vehicle(), other: vehicle({ name: 'other', is_station: false }) });

            await expect(service.writeGenericTelemetry(packet(), { uploaded_by: 'other' })).rejects.toBeInstanceOf(ValidationError);
        });

        it('accepts a station uploader', async () => {
            const { service, telemetryRepository } = createService({ balloon: vehicle(), chase: vehicle({ name: 'chase', is_station: true }) });

            await service.writeGenericTelemetry(packet(), { uploaded_by: 'chase' });

            expect(telemetryRepository.writeTelemetry).toHaveBeenCalledWith(PointType.LOCATION, expect.objectContaining({ uploader_callsign: 'chase' }));
        });
    });

    describe('sondehub upload', () => {
        it('uploads under the vehicle name when only aggregation is enabled', async () => {
            const { service, sondehub } = createService({ 'balloon-tx': vehicle({ upload_aggregation: true, upload_beacons: false }) });

            await service.writeGenericTelemetry(packet({ callsign: 'balloon-tx' }));

            expect(sondehub.addTelemetry).toHaveBeenCalledTimes(1);
            expect(sondehub.addTelemetry.mock.calls[0][0].payload_callsign).toBe('balloon');
        });

        it('uploads under the beacon callsign when only beacon upload is enabled', async () => {
            const { service, sondehub } = createService({ 'balloon-tx': vehicle({ upload_aggregation: false, upload_beacons: true }) });

            await service.writeGenericTelemetry(packet({ callsign: 'balloon-tx' }));

            expect(sondehub.addTelemetry.mock.calls[0][0].payload_callsign).toBe('balloon-tx');
        });

        it('uploads both callsigns when both settings are enabled', async () => {
            const { service, sondehub } = createService({ 'balloon-tx': vehicle({ upload_aggregation: true, upload_beacons: true }) });

            await service.writeGenericTelemetry(packet({ callsign: 'balloon-tx' }));

            expect(sondehub.addTelemetry.mock.calls.map((call) => call[0].payload_callsign)).toEqual(['balloon', 'balloon-tx']);
        });

        it('uploads once when the beacon callsign equals the vehicle name', async () => {
            const { service, sondehub } = createService({ balloon: vehicle({ upload_aggregation: true, upload_beacons: true }) });

            await service.writeGenericTelemetry(packet({ callsign: 'balloon' }));

            expect(sondehub.addTelemetry).toHaveBeenCalledTimes(1);
        });

        it('uploads nothing when both settings are disabled', async () => {
            const { service, sondehub, telemetryRepository } = createService({ balloon: vehicle({ upload_aggregation: false, upload_beacons: false }) });

            await service.writeGenericTelemetry(packet());

            expect(sondehub.addTelemetry).not.toHaveBeenCalled();
            expect(telemetryRepository.writeTelemetry).toHaveBeenCalledTimes(1);
        });

        it('sends a station position instead of telemetry for station vehicles', async () => {
            const { service, sondehub } = createService({ chase: vehicle({ name: 'chase', is_station: true }) });

            await service.writeGenericTelemetry(packet({ callsign: 'chase' }));

            expect(sondehub.uploadStationPosition).toHaveBeenCalledTimes(1);
            expect(sondehub.addTelemetry).not.toHaveBeenCalled();
        });

        it('defaults the uploader callsign when the packet carries none', async () => {
            const { service, sondehub } = createService({ balloon: vehicle() });

            await service.writeGenericTelemetry(packet());

            expect(sondehub.addTelemetry.mock.calls[0][0].uploader_callsign).toBe('GAPP-Server');
        });

        it('defaults the modulation to GFSK and allows an override', async () => {
            const { service, sondehub } = createService({ balloon: vehicle() });

            await service.writeGenericTelemetry(packet());
            await service.writeGenericTelemetry(packet({ _time: new Date(Date.now() + 1000).toISOString() }), { modulation: 'RTTY' });

            expect(sondehub.addTelemetry.mock.calls.map((call) => call[0].modulation)).toEqual(['GFSK', 'RTTY']);
        });

        it('maps the optional telemetry fields to sondehub names', async () => {
            const { service, sondehub } = createService({ balloon: vehicle() });

            await service.writeGenericTelemetry(
                packet({ velocity_horizontal: 12, velocity_vertical: -4, battery: 3.9, satellites: 9, temperature: -40, frame: 7 }),
            );

            expect(sondehub.addTelemetry.mock.calls[0][0]).toMatchObject({ vel_h: 12, vel_v: -4, batt: 3.9, sats: 9, temp: -40, frame: 7 });
        });
    });

    describe('backfill and ordering', () => {
        it('stores and uploads a backfilled packet', async () => {
            const { service, sondehub, telemetryRepository } = createService({ balloon: vehicle() });
            const now = new Date();
            const older = new Date(now.getTime() - 3 * 60 * 60 * 1000);

            await service.writeGenericTelemetry(packet({ _time: now.toISOString() }));
            await service.writeGenericTelemetry(packet({ _time: older.toISOString() }));

            expect(telemetryRepository.writeTelemetry).toHaveBeenCalledTimes(2);
            expect(sondehub.addTelemetry).toHaveBeenCalledTimes(2);
        });

        it('does not stream a backfilled packet to the dashboard', async () => {
            const { service, emitted } = createService({ balloon: vehicle() });
            const now = new Date();
            const older = new Date(now.getTime() - 3 * 60 * 60 * 1000);

            await service.writeGenericTelemetry(packet({ _time: now.toISOString() }));
            await service.writeGenericTelemetry(packet({ _time: older.toISOString() }));

            expect(emitted).toHaveLength(1);
        });

        it('streams every newer packet', async () => {
            const { service, emitted } = createService({ balloon: vehicle() });
            const now = Date.now();

            await service.writeGenericTelemetry(packet({ _time: new Date(now).toISOString() }));
            await service.writeGenericTelemetry(packet({ _time: new Date(now + 1000).toISOString() }));
            await service.writeGenericTelemetry(packet({ _time: new Date(now + 2000).toISOString() }));

            expect(emitted).toHaveLength(3);
        });

        it('tracks the newest packet per beacon independently', async () => {
            const { service, emitted } = createService({ 'tx-a': vehicle({ name: 'v' }), 'tx-b': vehicle({ name: 'v' }) });
            const now = Date.now();

            await service.writeGenericTelemetry(packet({ callsign: 'tx-a', _time: new Date(now + 5000).toISOString() }));
            await service.writeGenericTelemetry(packet({ callsign: 'tx-b', _time: new Date(now).toISOString() }));

            expect(emitted).toHaveLength(2);
        });
    });

    describe('clock skew', () => {
        it('warns when a packet is far in the future', async () => {
            const { service, logger } = createService({ balloon: vehicle() });
            const ahead = new Date(Date.now() + 20 * 60 * 1000).toISOString();

            await service.writeGenericTelemetry(packet({ _time: ahead }));

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn.mock.calls[0][0]).toMatchObject({ vehicle: 'balloon', beacon: 'balloon' });
        });

        it('stays quiet within the tolerance', async () => {
            const { service, logger } = createService({ balloon: vehicle() });

            await service.writeGenericTelemetry(packet({ _time: new Date(Date.now() + 60 * 1000).toISOString() }));

            expect(logger.warn).not.toHaveBeenCalled();
        });

        it('stays quiet for backfilled packets', async () => {
            const { service, logger } = createService({ balloon: vehicle() });

            await service.writeGenericTelemetry(packet({ _time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() }));

            expect(logger.warn).not.toHaveBeenCalled();
        });
    });

    describe('ttn', () => {
        it('uses the configured ttn uploader callsign and maps the payload', async () => {
            const { service, sondehub } = createService({
                'ttn-device': vehicle({ name: 'ttn-device' }),
                // the gateway has to exist as a station vehicle, same as any other uploader
                TTN_Gateway: vehicle({ name: 'TTN_Gateway', is_station: true }),
            });

            await service.writeTtnTelemetry({
                end_device_ids: { device_id: 'ttn-device' },
                uplink_message: {
                    received_at: new Date().toISOString(),
                    decoded_payload: { lat: 50, lon: 14, alt_m: 900, course: 180, speed_mps: 7.5 },
                },
            } as never);

            expect(sondehub.addTelemetry.mock.calls[0][0]).toMatchObject({ uploader_callsign: 'TTN_Gateway', modulation: 'LoRa', vel_h: 7.5, heading: 180 });
        });
    });
});
