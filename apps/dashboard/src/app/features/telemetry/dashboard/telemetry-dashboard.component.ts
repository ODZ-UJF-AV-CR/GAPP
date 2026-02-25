import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, type OnInit, signal, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import { LatencyService } from '@core/services/latency.service';
import type { GenericTelemetry, VehicleGet } from '@gapp/shared';
import { VehicleIconComponent } from '@shared/components/vehicle-icon/vehicle-icon.component';
import { VehicleService } from '@shared/services';
import { concat, filter, map, skip, switchMap, tap } from 'rxjs';
import { TelemetryService } from '../telemetry.service';

interface BeaconWithTelemetry {
    beacon: VehicleGet['beacons'][number];
    telemetry: WritableSignal<GenericTelemetry | undefined>;
}

interface VehicleWithTelemetry extends Omit<VehicleGet, 'beacons'> {
    beacons: BeaconWithTelemetry[];
}

const telemetryCompare = (prev: GenericTelemetry | undefined, next: GenericTelemetry | undefined) => prev?._time === next?._time;

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderContentDirective, VehicleIconComponent, NgTemplateOutlet],
})
export class TelemetryDashboardComponent implements OnInit {
    private vehiclesService = inject(VehicleService);
    private telemetryService = inject(TelemetryService);
    private latencyService = inject(LatencyService);

    private vehiclesWithTelemetry = signal<VehicleWithTelemetry[]>([]);
    private beaconsWithTelemetry = computed(() => this.vehiclesWithTelemetry().flatMap((vehicle) => vehicle.beacons));
    private vehiclesByVehicleType = computed(() => {
        const vehiclesList = this.vehiclesWithTelemetry();
        const typesList = this.vehiclesService.vehicleTypesList();

        return typesList.map((type) => ({
            vehicles: vehiclesList.filter((vehicle) => vehicle.vehicle_type_id === type.id),
            type,
        }));
    });

    public latency = toSignal(this.latencyService.latency$(5_000).pipe(map((latency) => (latency ? `${latency} ms` : `no internet`))));
    public stationTypes = computed(() => this.vehiclesByVehicleType().filter((entry) => entry.type.is_station));
    public mobileTypes = computed(() => this.vehiclesByVehicleType().filter((entry) => !entry.type.is_station));

    constructor() {
        this.vehiclesService.vehiclesList$
            .pipe(
                skip(1),
                filter((vehicles) => vehicles.length > 0),
                // Create initial data structure for VehicleWithTelemetry
                tap((vehicles) =>
                    this.vehiclesWithTelemetry.set(
                        vehicles.map((vehicle) => ({
                            ...vehicle,
                            beacons: vehicle.beacons.map((beacon) => ({
                                beacon,
                                telemetry: signal(undefined, {
                                    equal: telemetryCompare,
                                }),
                            })),
                        })),
                    ),
                ),
                // Extract callsigns list
                map((vehicles) => vehicles.flatMap((vehicle) => vehicle.beacons.map((beacon) => beacon.callsign))),
                switchMap((callsigns) =>
                    concat(
                        this.telemetryService.getLatestTelemetry$(callsigns),
                        this.telemetryService.streamTelemetry$(callsigns).pipe(map((data: GenericTelemetry) => [data])),
                    ),
                ),
                filter((data) => data.length > 0),
                takeUntilDestroyed(),
            )
            .subscribe((telemetry) => this.mapTelemetry(telemetry));
    }

    public ngOnInit() {
        this.vehiclesService.loadVehicleTypes();
        this.vehiclesService.loadVehicles();
    }

    private mapTelemetry(data: GenericTelemetry[]) {
        data.forEach((telemetry) =>
            this.beaconsWithTelemetry()
                .find(({ beacon }) => beacon.callsign === telemetry.callsign)
                ?.telemetry.set(telemetry),
        );
    }
}
