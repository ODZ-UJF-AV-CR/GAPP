import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, type OnInit, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import type { VehicleGet } from '@gapp/shared';
import { VehicleIconComponent } from '@shared/components/vehicle-icon/vehicle-icon.component';
import { VehicleService } from '@shared/services';
import { type BeaconContactData, type BeaconUploadData, LiveTelemetryStore } from '../live-telemetry.store';
import { VehicleRowComponent } from './vehicle-row.component';

export interface BeaconWithContact {
    beacon: NonNullable<VehicleGet['beacons']>[number];
    contact: Signal<BeaconContactData | undefined>;
    upload: Signal<BeaconUploadData | undefined>;
}

export interface VehicleWithContact extends Omit<VehicleGet, 'beacons'> {
    beacons: BeaconWithContact[];
}

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderContentDirective, VehicleIconComponent, NgTemplateOutlet, VehicleRowComponent],
})
export class TelemetryDashboardComponent implements OnInit {
    private vehiclesService = inject(VehicleService);
    private liveTelemetry = inject(LiveTelemetryStore);

    private vehiclesWithContact = computed<VehicleWithContact[]>(() =>
        this.vehiclesService.vehiclesList().map((vehicle) => ({
            ...vehicle,
            beacons: (vehicle.beacons ?? []).map((beacon) => ({
                beacon,
                contact: this.liveTelemetry.contactFor(beacon.callsign),
                upload: this.liveTelemetry.uploadFor(beacon.callsign),
            })),
        })),
    );

    private beaconsWithContact = computed(() => this.vehiclesWithContact().flatMap((vehicle) => vehicle.beacons));
    private vehiclesByVehicleType = computed(() => {
        const vehiclesList = this.vehiclesWithContact();

        return this.vehiclesService
            .vehicleTypesList()
            .map((type) => ({
                vehicles: vehiclesList.filter((vehicle) => vehicle.vehicle_type_id === type.id),
                type,
            }))
            .filter((entry) => entry.vehicles.length > 0);
    });

    public connectionStatus = this.liveTelemetry.connectionStatus;
    public connectedStatus = computed(() => `${this.beaconsWithContact().filter((beacon) => !!beacon.contact()).length}/${this.beaconsWithContact().length}`);
    public stationTypes = computed(() => this.vehiclesByVehicleType().filter((entry) => entry.type.is_station));
    public mobileTypes = computed(() => this.vehiclesByVehicleType().filter((entry) => !entry.type.is_station));

    constructor() {
        this.liveTelemetry.connect$().pipe(takeUntilDestroyed()).subscribe();
    }

    public ngOnInit() {
        this.vehiclesService.loadVehicleTypes();
        this.vehiclesService.loadVehicles(true);
    }
}
