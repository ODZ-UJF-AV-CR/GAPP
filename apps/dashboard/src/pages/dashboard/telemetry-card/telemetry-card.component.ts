import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BeaconWithTelemetry, VehicleWithTelemetry } from '../dashboard.service';
import { VehicleIconComponent } from '@/components/vehicle-icon/vehicle-icon.component';
import { TextLimitDirective, DialogButton, DialogDirective } from '@/ui';
import { VehicleType } from '@/services/vehicle.service';
import { BeaconItemComponent } from './beacon-item.component';


@Component({
    selector: 'telemetry-card',
    templateUrl: './telemetry-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [VehicleIconComponent, TextLimitDirective, BeaconItemComponent, DialogDirective],
})
export class TelemetryCardComponent {
    public vehicle = input.required<VehicleWithTelemetry>();
    public isSimpleMode = computed(() => this.vehicle().type === VehicleType.CAR);

    public sortedBeacons = computed(() => this.vehicle().beacons.sort((a, b) => (b.telemetry?._time.getTime() || 0) - (a.telemetry?._time.getTime() || 0)));
    private sondehubUrl = computed(
        () =>
            `https://amateur.sondehub.org/${this.vehicle()
                .beacons.map((b) => b.callsign)
                .join(',')}`
    );

    public trackFn(beacon: BeaconWithTelemetry) {
        return `${beacon.callsign}${beacon.telemetry?._time || 'na'}`;
    }

    public buttons: DialogButton[] = [
        {
            style: 'btn-info',
            label: 'Show on sondehub',
            action: () => {
                window.open(this.sondehubUrl(), '_blank');
            },
        },
        {
            style: 'btn-neutral',
            label: 'Close',
            close: true,
        },
    ];
}
