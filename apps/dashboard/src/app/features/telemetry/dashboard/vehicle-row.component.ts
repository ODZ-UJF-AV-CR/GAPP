import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { VehicleTypeGet } from '@gapp/shared';
import { BeaconRowComponent } from './beacon-row.component';
import type { VehicleWithTelemetry } from './telemetry-dashboard.component';

@Component({
    selector: 'vehicle-row',
    templateUrl: './vehicle-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeaconRowComponent],
})
export class VehicleRowComponent {
    public vehicle = input.required<VehicleWithTelemetry>();
    public type = input.required<VehicleTypeGet>();

    public beacons = computed(() => this.vehicle().beacons);
}
