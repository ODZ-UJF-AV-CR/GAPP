import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, type OnInit, signal, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import type { DashboardStream, VehicleGet } from '@gapp/shared';
import { VehicleIconComponent } from '@shared/components/vehicle-icon/vehicle-icon.component';
import { VehicleService } from '@shared/services';
import { filter, map, switchMap, tap } from 'rxjs';
import { TelemetryService } from '../telemetry.service';
import { VehicleRowComponent } from './vehicle-row.component';

export type BeaconContactData = DashboardStream['telemetry'][number];
export type BeaconUploadData = DashboardStream['uploaderContact'][number];

export interface BeaconWithContact {
    beacon: NonNullable<VehicleGet['beacons']>[number];
    contact: WritableSignal<BeaconContactData | undefined>;
    upload: WritableSignal<BeaconUploadData | undefined>;
}

export interface VehicleWithContact extends Omit<VehicleGet, 'beacons'> {
    beacons: BeaconWithContact[];
}

const contactCompare = (prev: BeaconContactData | undefined, next: BeaconContactData | undefined) =>
    prev?._time === next?._time && prev?.uploader_callsign === next?.uploader_callsign;

const uploadCompare = (prev: BeaconUploadData | undefined, next: BeaconUploadData | undefined) => prev?._time === next?._time;

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderContentDirective, VehicleIconComponent, NgTemplateOutlet, VehicleRowComponent],
})
export class TelemetryDashboardComponent implements OnInit {
    private vehiclesService = inject(VehicleService);
    private telemetryService = inject(TelemetryService);

    private beaconsByCallsign = new Map<string, BeaconWithContact>();

    private vehiclesWithContact = signal<VehicleWithContact[]>([]);
    private beaconsWithContact = computed(() => this.vehiclesWithContact().flatMap((vehicle) => vehicle.beacons));
    private vehiclesByVehicleType = computed(() => {
        const vehiclesList = this.vehiclesWithContact();
        const typesList = this.vehiclesService.vehicleTypesList();

        return typesList.map((type) => ({
            vehicles: vehiclesList.filter((vehicle) => vehicle.vehicle_type_id === type.id),
            type,
        }));
    });

    public connectedStatus = computed(() => `${this.beaconsWithContact().filter((b) => !!b.contact()).length}/${this.beaconsWithContact().length}`);
    public stationTypes = computed(() => this.vehiclesByVehicleType().filter((entry) => entry.type.is_station));
    public mobileTypes = computed(() => this.vehiclesByVehicleType().filter((entry) => !entry.type.is_station));

    constructor() {
        this.vehiclesService.vehiclesList$
            .pipe(
                filter((vehicles) => vehicles.length > 0),
                tap((vehicles) => this.initVehicles(vehicles)),
                map(() => [...this.beaconsByCallsign.keys()]),
                switchMap((callsigns) => this.telemetryService.streamDashboard$(callsigns)),
                takeUntilDestroyed(),
            )
            .subscribe((data) => this.mapStreamData(data));
    }

    public ngOnInit() {
        this.vehiclesService.loadVehicleTypes();
        this.vehiclesService.loadVehicles(true);
    }

    private initVehicles(vehicles: VehicleGet[]) {
        this.beaconsByCallsign = new Map();

        this.vehiclesWithContact.set(
            vehicles.map((vehicle) => ({
                ...vehicle,
                beacons: (vehicle.beacons ?? []).map((beacon) => {
                    const entry: BeaconWithContact = {
                        beacon,
                        contact: signal(undefined, { equal: contactCompare }),
                        upload: signal(undefined, { equal: uploadCompare }),
                    };

                    this.beaconsByCallsign.set(beacon.callsign, entry);
                    return entry;
                }),
            })),
        );
    }

    private mapStreamData({ telemetry, uploaderContact }: DashboardStream) {
        telemetry.forEach((contact) => this.beaconsByCallsign.get(contact.callsign)?.contact.set(contact));
        uploaderContact.forEach((upload) => this.beaconsByCallsign.get(upload.uploader_callsign)?.upload.set(upload));
    }
}
