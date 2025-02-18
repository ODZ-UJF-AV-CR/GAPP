import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { Vessel } from '@/services/vessels.service';
import { TimeAgoBadgeComponent } from '@/components/time-ago-badge/time-ago-badge.component';

@Component({
    selector: 'vessel-status-card',
    templateUrl: './vessel-status-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoBadgeComponent],
})
export class VesselStatusCardComponent {
    public vessel = input<Vessel>();
    public telemetry = input<TelemetryStatus[]>();

    public lastContact = computed(() => {
        const telemetry = this.telemetry();
        return telemetry?.sort((a, b) => Date.parse(b._time) - Date.parse(a._time))?.[0];
    });

    public getTransmitterTelemetry(transmitter: string) {
        return computed(() => this.telemetry()?.find((t) => t.callsign === transmitter));
    }
}
