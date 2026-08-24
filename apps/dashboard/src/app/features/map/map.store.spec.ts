import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@core/services/api.service';
import type { MapData, MapStream, VehicleGet, VehicleTypeGet } from '@gapp/shared';
import { GAPP_MAP_VEHICLE_ICONS, type GappMapVehicleIcons } from '@shared/components/gapp-map';
import { VehicleService } from '@shared/services';
import { Subject } from 'rxjs';
import { MapStore } from './map.store';

const BALLOON_TYPE: VehicleTypeGet = { id: 1, type_name: 'balloon', is_station: false };
const CAR_TYPE: VehicleTypeGet = { id: 2, type_name: 'car', is_station: true };

const VEHICLES = [
    { id: 10, name: 'balloon-1', vehicle_type_id: 1, beacons: [{ id: 100, callsign: 'bal-1' }] },
    { id: 11, name: 'car-1', vehicle_type_id: 2, beacons: [{ id: 101, callsign: 'car-1' }] },
] as VehicleGet[];

const VEHICLE_ICONS: GappMapVehicleIcons = {
    defaultIcon: 'baloon',
    icons: { car: 'chase-car', balloon: 'baloon' },
};

const point = (overrides: Partial<MapData> = {}): MapData => ({
    callsign: 'bal-1',
    latitude: 50,
    longitude: 14,
    altitude: 1000,
    _time: '2026-08-19T21:00:00.000Z',
    ...overrides,
});

const geometryOf = (features: GeoJSON.Feature[], callsign: string) => features.find((f) => f.properties?.['callsign'] === callsign)?.geometry;

describe('MapStore', () => {
    let store: MapStore;
    let stream: Subject<MapStream>;

    beforeEach(() => {
        stream = new Subject<MapStream>();

        TestBed.configureTestingModule({
            providers: [
                MapStore,
                { provide: ApiService, useValue: { sse$: () => stream.asObservable() } },
                { provide: GAPP_MAP_VEHICLE_ICONS, useValue: VEHICLE_ICONS },
                {
                    provide: VehicleService,
                    useValue: {
                        vehiclesList: signal(VEHICLES),
                        vehicleTypesList: signal([BALLOON_TYPE, CAR_TYPE]),
                    },
                },
            ],
        });

        store = TestBed.inject(MapStore);
        store.connect$().subscribe();
    });

    it('draws a line along the track of a moving vehicle', () => {
        stream.next({
            telemetry: [point({ longitude: 14, latitude: 50 }), point({ _time: '2026-08-19T21:01:00.000Z', longitude: 15, latitude: 51 })],
        });

        expect(geometryOf(store.trackFeatures().features, 'bal-1')).toEqual({
            type: 'LineString',
            coordinates: [
                [14, 50],
                [15, 51],
            ],
        });
    });

    it('draws no line for a station', () => {
        stream.next({
            telemetry: [
                point({ callsign: 'car-1', longitude: 14, latitude: 50 }),
                point({ callsign: 'car-1', _time: '2026-08-19T21:01:00.000Z', longitude: 15, latitude: 51 }),
            ],
        });

        expect(store.trackFeatures().features).toEqual([]);
    });

    it('marks a station with the car icon and a moving vehicle with the balloon icon', () => {
        stream.next({ telemetry: [point({ callsign: 'bal-1' }), point({ callsign: 'car-1' })] });

        const icons = Object.fromEntries(store.markerFeatures().features.map((f) => [f.properties?.['callsign'], f.properties?.['icon']]));

        expect(icons).toEqual({ 'bal-1': 'baloon', 'car-1': 'chase-car' });
    });

    it('puts the marker on the newest point of the track', () => {
        stream.next({ telemetry: [point({ longitude: 14, latitude: 50 })] });
        stream.next({ telemetry: [point({ _time: '2026-08-19T21:05:00.000Z', longitude: 16, latitude: 52 })] });

        expect(geometryOf(store.markerFeatures().features, 'bal-1')).toEqual({ type: 'Point', coordinates: [16, 52] });
    });

    it('drops points already received when the snapshot is replayed', () => {
        const snapshot = [point({ longitude: 14 }), point({ _time: '2026-08-19T21:01:00.000Z', longitude: 15 })];

        stream.next({ telemetry: snapshot });
        stream.next({ telemetry: snapshot });

        const geometry = geometryOf(store.trackFeatures().features, 'bal-1') as GeoJSON.LineString;
        expect(geometry.coordinates).toHaveLength(2);
    });

    it('ignores callsigns without a known vehicle', () => {
        stream.next({ telemetry: [point({ callsign: 'unknown-1' }), point({ callsign: 'unknown-1', _time: '2026-08-19T21:01:00.000Z' })] });

        expect(store.markerFeatures().features).toEqual([]);
        expect(store.trackFeatures().features).toEqual([]);
    });

    it('needs two points before a track becomes a line', () => {
        stream.next({ telemetry: [point()] });

        expect(store.trackFeatures().features).toEqual([]);
        expect(store.markerFeatures().features).toHaveLength(1);
    });
});
