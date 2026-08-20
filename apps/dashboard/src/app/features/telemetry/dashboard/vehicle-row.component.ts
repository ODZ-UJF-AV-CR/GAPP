import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { VehicleTypeGet } from '@gapp/shared';
import { BeaconRowComponent } from './beacon-row.component';
import type { VehicleWithContact } from './telemetry-dashboard.component';

@Component({
    selector: 'vehicle-row',
    templateUrl: './vehicle-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeaconRowComponent, RouterLink],
})
export class VehicleRowComponent {
    public vehicle = input.required<VehicleWithContact>();
    public type = input.required<VehicleTypeGet>();

    public beacons = computed(() => this.vehicle().beacons);
    public isStation = computed(() => this.type().is_station);
}
