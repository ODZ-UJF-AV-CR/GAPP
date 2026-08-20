import type { DashboardStream, MapStream, TelemetryRecord, VehicleTelemetryStream } from '@gapp/shared';
import type { EventMessage } from 'fastify-sse-v2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Events } from '../plugins/event-bus.ts';
import { NotFoundError } from '../utils/errors.ts';
import { EventBus } from '../utils/event-bus.ts';
import { LiveDataService } from './live-data.service.ts';

const parse = <T>(message: EventMessage) => JSON.parse(message.data ?? '') as T;

const collect = async (generator: AsyncGenerator<EventMessage>, count: number) => {
    const messages: EventMessage[] = [];

    for (let i = 0; i < count; i++) {
        const { value, done } = await generator.next();

        if (done || !value) {
            break;
        }

        messages.push(value);
    }

    return messages;
};

const telemetryRecord = (overrides: Partial<TelemetryRecord> = {}): TelemetryRecord => ({
    callsign: 'balloon-tx',
    latitude: 50,
    longitude: 14,
    altitude: 1000,
    _time: new Date().toISOString(),
    ...overrides,
});

describe('LiveDataService', () => {
    beforeEach(() => vi.useRealTimers());

    const createService = (
        options: {
            vehiclesById?: Record<number, unknown>;
            locations?: unknown[];
            contacts?: unknown[];
            history?: TelemetryRecord[];
            tracks?: unknown[];
            beaconFlags?: { callsign: string; is_station: boolean }[];
        } = {},
    ) => {
        const telemetryRepository = {
            getCallsignsLastLocation: vi.fn(async () => options.locations ?? []),
            getUploadersLastContact: vi.fn(async () => options.contacts ?? []),
            getVehicleTelemetry: vi.fn(async () => options.history ?? []),
            getCallsignsTrack: vi.fn(async () => options.tracks ?? []),
        };
        const vehiclesRepository = {
            getVehicleById: vi.fn(async (id: number) => options.vehiclesById?.[id]),
            getBeaconCallsignsWithStationFlag: vi.fn(async () => options.beaconFlags ?? []),
        };
        const eventBus = new EventBus<Events>();
        const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() };

        const service = new LiveDataService(telemetryRepository as never, vehiclesRepository as never, eventBus, logger as never);

        return { service, telemetryRepository, vehiclesRepository, eventBus, logger };
    };

    describe('getDashboardStream', () => {
        it('delivers the initial snapshot followed by live updates', async () => {
            const time = new Date().toISOString();
            const { service, eventBus } = createService({
                locations: [{ _time: time, callsign: 'tx-1', uploader_callsign: 'gw-1', latitude: 50, longitude: 14, altitude: 100 }],
                contacts: [{ _time: time, uploader_callsign: 'gw-1' }],
            });

            const ac = new AbortController();
            const stream = service.getDashboardStream(['tx-1'])(ac);
            const initial = await stream.next();

            expect(parse<DashboardStream>(initial.value as EventMessage)).toEqual({
                telemetry: [{ _time: time, callsign: 'tx-1', uploader_callsign: 'gw-1' }],
                uploaderContact: [{ _time: time, uploader_callsign: 'gw-1' }],
            });

            const next = stream.next();
            eventBus.emit('telemetry.new', telemetryRecord({ callsign: 'tx-1', uploader_callsign: 'gw-1' }));
            const live = await next;

            expect(parse<DashboardStream>(live.value as EventMessage)).toMatchObject({
                telemetry: [{ callsign: 'tx-1' }],
            });

            ac.abort();
        });

        it('recovers with an empty initial state on snapshot error', async () => {
            const { service, telemetryRepository, logger } = createService();
            telemetryRepository.getCallsignsLastLocation.mockRejectedValueOnce(new Error('Influx down'));

            const ac = new AbortController();
            const stream = service.getDashboardStream()(ac);
            const [first] = await collect(stream, 1);

            expect(parse<DashboardStream>(first)).toEqual({ telemetry: [], uploaderContact: [] });
            expect(logger.error).toHaveBeenCalled();

            ac.abort();
        });
    });

    describe('getVehicleTelemetryStream', () => {
        it('throws NotFoundError when vehicle does not exist', async () => {
            const { service } = createService({ vehiclesById: {} });

            await expect(service.getVehicleTelemetryStream(999)).rejects.toBeInstanceOf(NotFoundError);
        });

        it('delivers 24h telemetry snapshot and live updates for vehicle beacons', async () => {
            const time = new Date().toISOString();
            const record = telemetryRecord({ callsign: 'tx-1', _time: time });
            const { service, eventBus } = createService({
                vehiclesById: {
                    1: { id: 1, name: 'balloon', beacons: [{ id: 10, callsign: 'tx-1' }] },
                },
                history: [record],
            });

            const ac = new AbortController();
            const streamFn = await service.getVehicleTelemetryStream(1);
            const stream = streamFn(ac);

            const initial = await stream.next();
            expect(parse<VehicleTelemetryStream>(initial.value as EventMessage)).toEqual({
                telemetry: [record],
            });

            const next = stream.next();
            const newRecord = telemetryRecord({ callsign: 'tx-1', altitude: 2000 });
            eventBus.emit('telemetry.new', newRecord);
            const live = await next;

            expect(parse<VehicleTelemetryStream>(live.value as EventMessage)).toEqual({
                telemetry: [newRecord],
            });

            ac.abort();
        });

        it('ignores live updates from other vehicles', async () => {
            const { service, eventBus } = createService({
                vehiclesById: {
                    1: { id: 1, name: 'balloon', beacons: [{ id: 10, callsign: 'tx-1' }] },
                },
                history: [],
            });

            const ac = new AbortController();
            const streamFn = await service.getVehicleTelemetryStream(1);
            const stream = streamFn(ac);

            await stream.next(); // snapshot

            const next = stream.next();
            eventBus.emit('telemetry.new', telemetryRecord({ callsign: 'other-beacon' }));
            eventBus.emit('telemetry.new', telemetryRecord({ callsign: 'tx-1' }));
            const live = await next;

            expect(parse<VehicleTelemetryStream>(live.value as EventMessage)).toMatchObject({
                telemetry: [{ callsign: 'tx-1' }],
            });

            ac.abort();
        });

        it('handles vehicle with no beacons without querying influx', async () => {
            const { service, telemetryRepository } = createService({
                vehiclesById: {
                    1: { id: 1, name: 'balloon', beacons: [] },
                },
            });

            const ac = new AbortController();
            const streamFn = await service.getVehicleTelemetryStream(1);
            const stream = streamFn(ac);

            const initial = await stream.next();
            expect(parse<VehicleTelemetryStream>(initial.value as EventMessage)).toEqual({ telemetry: [] });
            expect(telemetryRepository.getVehicleTelemetry).not.toHaveBeenCalled();

            ac.abort();
        });
    });

    describe('getMapStream', () => {
        it('delivers initial snapshot with tracks for vehicles and last position for stations', async () => {
            const time = new Date().toISOString();
            const balloonPoint = { _time: time, callsign: 'balloon-tx', latitude: 50.1, longitude: 14.1, altitude: 2500, uploader_callsign: 'gw-1' };
            const carPoint = { _time: time, callsign: 'car-tx', latitude: 50.0, longitude: 14.0, altitude: 200, uploader_callsign: 'gw-1' };

            const { service, eventBus, telemetryRepository } = createService({
                beaconFlags: [
                    { callsign: 'balloon-tx', is_station: false },
                    { callsign: 'car-tx', is_station: true },
                ],
                tracks: [balloonPoint],
                locations: [carPoint],
            });

            const ac = new AbortController();
            const streamFn = await service.getMapStream(['balloon-tx', 'car-tx']);
            const stream = streamFn(ac);

            const initial = await stream.next();
            expect(parse<MapStream>(initial.value as EventMessage)).toEqual({
                telemetry: [balloonPoint, carPoint],
            });
            expect(telemetryRepository.getCallsignsTrack).toHaveBeenCalledWith(['balloon-tx'], 24);
            expect(telemetryRepository.getCallsignsLastLocation).toHaveBeenCalledWith(['car-tx']);

            const next = stream.next();
            const liveRecord = telemetryRecord({ callsign: 'balloon-tx', altitude: 2600, uploader_callsign: 'gw-2' });
            eventBus.emit('telemetry.new', liveRecord);
            const live = await next;

            expect(parse<MapStream>(live.value as EventMessage)).toEqual({
                telemetry: [
                    {
                        _time: liveRecord._time,
                        callsign: 'balloon-tx',
                        latitude: 50,
                        longitude: 14,
                        altitude: 2600,
                        uploader_callsign: 'gw-2',
                    },
                ],
            });

            ac.abort();
        });

        it('skips unknown callsigns without querying influx', async () => {
            const { service, telemetryRepository } = createService({
                beaconFlags: [],
            });

            const ac = new AbortController();
            const streamFn = await service.getMapStream(['unknown-callsign']);
            const stream = streamFn(ac);

            const initial = await stream.next();
            expect(parse<MapStream>(initial.value as EventMessage)).toEqual({ telemetry: [] });
            expect(telemetryRepository.getCallsignsTrack).not.toHaveBeenCalled();
            expect(telemetryRepository.getCallsignsLastLocation).not.toHaveBeenCalled();

            ac.abort();
        });

        it('forwards custom hours to getCallsignsTrack', async () => {
            const { service, telemetryRepository } = createService({
                beaconFlags: [{ callsign: 'balloon-tx', is_station: false }],
                tracks: [],
            });

            const ac = new AbortController();
            const streamFn = await service.getMapStream(['balloon-tx'], 48);
            const stream = streamFn(ac);

            await stream.next();
            expect(telemetryRepository.getCallsignsTrack).toHaveBeenCalledWith(['balloon-tx'], 48);

            ac.abort();
        });

        it('ignores live updates for unwatched callsigns', async () => {
            const { service, eventBus } = createService({
                beaconFlags: [{ callsign: 'balloon-tx', is_station: false }],
                tracks: [],
            });

            const ac = new AbortController();
            const streamFn = await service.getMapStream(['balloon-tx']);
            const stream = streamFn(ac);

            await stream.next();

            const next = stream.next();
            eventBus.emit('telemetry.new', telemetryRecord({ callsign: 'other-callsign' }));
            eventBus.emit('telemetry.new', telemetryRecord({ callsign: 'balloon-tx' }));
            const live = await next;

            expect(parse<MapStream>(live.value as EventMessage)).toMatchObject({
                telemetry: [{ callsign: 'balloon-tx' }],
            });

            ac.abort();
        });

        it('recovers with empty initial snapshot on error', async () => {
            const { service, telemetryRepository, logger } = createService({
                beaconFlags: [{ callsign: 'balloon-tx', is_station: false }],
            });
            telemetryRepository.getCallsignsTrack.mockRejectedValueOnce(new Error('Influx down'));

            const ac = new AbortController();
            const streamFn = await service.getMapStream(['balloon-tx']);
            const stream = streamFn(ac);

            const initial = await stream.next();
            expect(parse<MapStream>(initial.value as EventMessage)).toEqual({ telemetry: [] });
            expect(logger.error).toHaveBeenCalled();

            ac.abort();
        });
    });
});
