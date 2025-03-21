import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BeaconWithTelemetry, VehicleWithTelemetry } from '../dashboard.service';
import { VehicleIconComponent } from '@/components/vehicle-icon/vehicle-icon.component';
import { TextLimitDirective } from '@gapp/ui/utils';
import { VehicleType } from '@/services/vehicle.service';
import { BeaconItemComponent } from './beacon-item.component';
import { DialogComponent } from '@gapp/ui/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'telemetry-card',
    templateUrl: './telemetry-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [VehicleIconComponent, TextLimitDirective, BeaconItemComponent, DialogComponent],
})
export class TelemetryCardComponent {
    private sanitizer = inject(DomSanitizer);

    public vehicle = input.required<VehicleWithTelemetry>();
    public isSimpleMode = computed(() => this.vehicle().type === VehicleType.CAR);

    public trackFn(beacon: BeaconWithTelemetry) {
        return `${beacon.callsign}${beacon.telemetry?._time || 'na'}`;
    }

    public sortedBeacons = computed(() => this.vehicle().beacons.sort((a, b) => (b.telemetry?._time.getTime() || 0) - (a.telemetry?._time.getTime() || 0)));

    public sondehubSource = computed(() => {
        const beaconsQuery = this.vehicle()
            .beacons.map((b) => b.callsign)
            .join(',');
        const url = encodeURI(`https://amateur.sondehub.org/index.html?embed=1&hidelist=1&hidegraph=1&expandgraph=0#!mt=Mapnik&q=${beaconsQuery}`);
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
}
