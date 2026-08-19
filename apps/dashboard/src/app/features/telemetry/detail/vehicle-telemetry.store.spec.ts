import { TestBed } from '@angular/core/testing';
import { ApiService } from '@core/services/api.service';
import type { TelemetryRecord, VehicleTelemetryStream } from '@gapp/shared';
import { Subject } from 'rxjs';
import { VehicleTelemetryStore } from './vehicle-telemetry.store';

const record = (overrides: Partial<TelemetryRecord> = {}): TelemetryRecord => ({
    callsign: 'tx-1',
    latitude: 50,
    longitude: 14,
    altitude: 1000,
    _time: '2026-08-19T21:00:00.000Z',
    ...overrides,
});

describe('VehicleTelemetryStore', () => {
    let store: VehicleTelemetryStore;
    let stream: Subject<VehicleTelemetryStream>;

    beforeEach(() => {
        stream = new Subject<VehicleTelemetryStream>();

        TestBed.configureTestingModule({
            providers: [VehicleTelemetryStore, { provide: ApiService, useValue: { sse$: () => stream.asObservable() } }],
        });

        store = TestBed.inject(VehicleTelemetryStore);
        store.connect$(1).subscribe();
    });

    it('puts the newest packet of the snapshot on top', () => {
        stream.next({
            telemetry: [
                record({ _time: '2026-08-19T21:00:00.000Z', frame: 1 }),
                record({ _time: '2026-08-19T21:01:00.000Z', frame: 2 }),
                record({ _time: '2026-08-19T21:02:00.000Z', frame: 3 }),
            ],
        });

        expect(store.entries().map((entry) => entry.record.frame)).toEqual([3, 2, 1]);
    });

    it('prepends live packets', () => {
        stream.next({ telemetry: [record({ _time: '2026-08-19T21:00:00.000Z', frame: 1 })] });
        stream.next({ telemetry: [record({ _time: '2026-08-19T21:05:00.000Z', frame: 2 })] });

        expect(store.entries().map((entry) => entry.record.frame)).toEqual([2, 1]);
        expect(store.count()).toBe(2);
    });

    it('drops packets already received when the snapshot is replayed', () => {
        const snapshot = [record({ _time: '2026-08-19T21:00:00.000Z', frame: 1 }), record({ _time: '2026-08-19T21:01:00.000Z', frame: 2 })];

        stream.next({ telemetry: snapshot });
        stream.next({ telemetry: snapshot });

        expect(store.count()).toBe(2);
    });

    it('treats differently formatted timestamps of the same instant as one packet', () => {
        stream.next({ telemetry: [record({ _time: '2026-08-19T21:57:24.000Z' })] });
        stream.next({ telemetry: [record({ _time: '2026-08-19T21:57:24Z' })] });

        expect(store.count()).toBe(1);
    });

    it('keeps packets of different beacons sharing a timestamp', () => {
        stream.next({
            telemetry: [record({ callsign: 'tx-1', _time: '2026-08-19T21:00:00.000Z' }), record({ callsign: 'tx-2', _time: '2026-08-19T21:00:00.000Z' })],
        });

        expect(store.count()).toBe(2);
    });

    it('caps the log and forgets the dropped packets', () => {
        const packets = Array.from({ length: 5010 }, (_, index) =>
            record({ _time: new Date(Date.UTC(2026, 7, 19) + index * 1000).toISOString(), frame: index }),
        );

        stream.next({ telemetry: packets });

        expect(store.count()).toBe(5000);
        expect(store.entries()[0].record.frame).toBe(5009);

        // the oldest packets fell out of the log, so they are accepted again instead of being treated as duplicates
        stream.next({ telemetry: [packets[0]] });
        expect(store.count()).toBe(5000);
        expect(store.entries()[0].record.frame).toBe(0);
    });

    it('precomputes the single line json of a packet', () => {
        stream.next({ telemetry: [record({ frame: 7 })] });

        expect(store.entries()[0].json).toBe(JSON.stringify(record({ frame: 7 })));
    });
});
