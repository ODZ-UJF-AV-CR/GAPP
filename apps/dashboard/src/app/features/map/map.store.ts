import { computed, Injectable, inject, signal } from '@angular/core';
import { ApiService, type SseStatus } from '@core/services/api.service';
import type { MapData, MapStream } from '@gapp/shared';
import { GAPP_MAP_VEHICLE_ICONS } from '@shared/components/gapp-map';
import { VehicleService } from '@shared/services';
import { finalize, retry, share, tap } from 'rxjs';

interface VehicleKind {
    typeName: string;
    isStation: boolean;
}

const RECONNECT_DELAY_MS = 3000;
const MAX_POINTS_PER_CALLSIGN = 5000;

/** @description Callsign and time are the InfluxDB point key, so two packets never share it */
const pointKey = (point: MapData) => `${point.callsign}|${Date.parse(point._time)}`;

/**
 * Holds the position track of every watched beacon, keyed by callsign. The stream is shared and closes once the
 * last consumer unsubscribes, the accumulated tracks survive so returning to the map renders instantly.
 */
@Injectable({ providedIn: 'root' })
export class MapStore {
    private apiService = inject(ApiService);
    private vehicleService = inject(VehicleService);
    private vehicleIcons = inject(GAPP_MAP_VEHICLE_ICONS);

    private status = signal<SseStatus>('idle');
    private tracks = signal<ReadonlyMap<string, MapData[]>>(new Map());
    private seenKeys = new Set<string>();

    public connectionStatus = this.status.asReadonly();
    public isLive = computed(() => this.status() === 'live');

    /** @description The stream only carries a callsign, the vehicle type has to be joined through the beacons */
    private vehicleByCallsign = computed(() => {
        const typeById = new Map(this.vehicleService.vehicleTypesList().map((type) => [type.id, type]));
        const byCallsign = new Map<string, VehicleKind>();

        this.vehicleService.vehiclesList().forEach((vehicle) => {
            const type = typeById.get(vehicle.vehicle_type_id);

            if (type) {
                vehicle.beacons?.forEach((beacon) => byCallsign.set(beacon.callsign, { typeName: type.type_name, isStation: type.is_station }));
            }
        });

        return byCallsign;
    });

    /** @description Stations stay put, so only moving vehicles get a path drawn */
    public trackFeatures = computed<GeoJSON.FeatureCollection>(() => {
        const vehicles = this.vehicleByCallsign();

        return {
            type: 'FeatureCollection',
            features: [...this.tracks()]
                .filter(([callsign, points]) => points.length > 1 && vehicles.get(callsign)?.isStation === false)
                .map(([callsign, points]) => ({
                    type: 'Feature' as const,
                    properties: { callsign },
                    geometry: {
                        type: 'LineString' as const,
                        coordinates: points.map((point) => [point.longitude, point.latitude]),
                    },
                })),
        };
    });

    public markerFeatures = computed<GeoJSON.FeatureCollection>(() => {
        const vehicles = this.vehicleByCallsign();

        return {
            type: 'FeatureCollection',
            features: [...this.tracks()]
                .map(([callsign, points]) => ({ callsign, kind: vehicles.get(callsign), last: points.at(-1) }))
                .filter(({ kind, last }) => !!kind && !!last)
                .map(({ callsign, kind, last }) => ({
                    type: 'Feature' as const,
                    properties: {
                        callsign,
                        icon: this.vehicleIcons.icons[kind.typeName] ?? this.vehicleIcons.defaultIcon,
                        altitude: last.altitude,
                        time: last._time,
                    },
                    geometry: {
                        type: 'Point' as const,
                        coordinates: [last.longitude, last.latitude],
                    },
                })),
        };
    });

    private stream$ = this.apiService
        .sse$<MapStream>('/live-data/map', (status) => this.status.set(status))
        .pipe(
            tap(({ telemetry }) => this.append(telemetry)),
            retry({ delay: RECONNECT_DELAY_MS }),
            finalize(() => this.status.set('idle')),
            share(),
        );

    public connect$() {
        return this.stream$;
    }

    /** @description The whole snapshot is replayed after every reconnect, so already known points are dropped */
    private append(points: MapData[]) {
        const fresh = points.filter((point) => !this.seenKeys.has(pointKey(point)));

        if (!fresh.length) {
            return;
        }

        fresh.forEach((point) => this.seenKeys.add(pointKey(point)));

        this.tracks.update((current) => {
            const next = new Map(current);

            fresh.forEach((point) => {
                // the snapshot arrives oldest first and live packets are always the newest, so appending keeps order
                const track = [...(next.get(point.callsign) ?? []), point];
                next.set(point.callsign, track.slice(-MAX_POINTS_PER_CALLSIGN));
            });

            return next;
        });
    }
}
