import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { Vessel } from '@/services/vessels.service';
import { TimeAgoBadgeComponent } from '@/components/time-ago-badge/time-ago-badge.component';
import { DialogComponent } from '@gapp/ui/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerExternalLink } from '@ng-icons/tabler-icons';

@Component({
    selector: 'vessel-status-card',
    templateUrl: './vessel-status-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoBadgeComponent, DialogComponent, NgIcon],
    providers: [provideIcons({ tablerExternalLink })],
})
export class VesselStatusCardComponent {
    public vessel = input.required<Vessel>();
    public telemetry = input.required<TelemetryStatus[]>();

    public lastContact = computed(() => {
        const telemetry = this.telemetry();
        return telemetry.sort((a, b) => Date.parse(b._time) - Date.parse(a._time))?.[0];
    });

    public getTransmitterTelemetry(transmitter: string) {
        return computed(() => this.telemetry()?.find((t) => t.callsign === transmitter));
    }
}
