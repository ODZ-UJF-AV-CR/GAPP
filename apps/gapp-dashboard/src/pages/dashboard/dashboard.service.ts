import { ApiServiceBase } from '@/services/api.service.base';
import { TelemetryData, TelemetryService } from '@/services/telemetry.service';
import { Beacon, Vehicle, VehicleService } from '@/services/vehicle.service';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';

export type BeaconWithTelemetry = Beacon & { telemetry?: TelemetryData };

export interface VehicleWithTelemetry extends Vehicle {
    beacons: BeaconWithTelemetry[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiServiceBase {
    private telemetryService = inject(TelemetryService);
    private vehicleService = inject(VehicleService);

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

        this.telemetrySubscription = this.telemetryService.latestData$().subscribe((telemetry) => this.telemetry.set(telemetry));
    }

    public deinit() {
        this.telemetrySubscription?.unsubscribe();
        this.telemetrySubscription = undefined;
    }
}
