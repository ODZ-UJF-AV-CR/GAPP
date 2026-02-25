import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { VehicleTypeGet } from '@gapp/shared';
import type { VehicleWithTelemetry } from './telemetry-dashboard.component';

@Component({
    selector: 'telemetry-data',
    templateUrl: './telemetry-data.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelemetryDataComponent {
    public vehicle = input.required<VehicleWithTelemetry>();
    public type = input.required<VehicleTypeGet>();

    public beacons = computed(() => this.vehicle().beacons);
}
