import { computed, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '@core/services/api.service';
import { type Beacon, type Vehicle, VehicleService } from '@shared/services';
import type { Subscription } from 'rxjs';

export interface TelemetryData {
    _time: Date;
    altitude: number;
    callsign: string;
    latitude: number;
    longitude: number;
}

export type BeaconWithTelemetry = Beacon & { telemetry?: TelemetryData };

export interface VehicleWithTelemetry extends Vehicle {
    beacons: BeaconWithTelemetry[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private vehicleService = inject(VehicleService);
    private apiService = inject(ApiService);
    private destroyRef = inject(DestroyRef);

    private telemetrySubscription?: Subscription;
    private telemetry = signal<TelemetryData[]>([]);

    public vehiclesWithTelemetry = computed<VehicleWithTelemetry[]>(() => {
        const vehicles = this.vehicleService.vehiclesList();
        const telemetry = this.telemetry();

        return vehicles.map((vehicle) => ({
            ...vehicle,
            beacons: vehicle.beacons.map((beacon) => ({
                ...beacon,
                telemetry: telemetry.find((t) => t.callsign === beacon.callsign),
            })),
        }));
    });

    public init() {
        if (this.telemetrySubscription) {
            throw 'DashboardService already initialized';
        }

        this.telemetrySubscription = this.apiService
            .sse$<TelemetryData[]>('/telemetry/stream')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((telemetry) => this.telemetry.set(telemetry.map((t) => ({ ...t, _time: new Date(t._time) }))));
    }

    public deinit() {
        this.telemetrySubscription?.unsubscribe();
        this.telemetrySubscription = undefined;
    }
}
