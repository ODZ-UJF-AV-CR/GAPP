import { Component, computed, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { Vessel } from '@/services/vessels.service';
import { TimeAgoComponent } from '@gapp/ui/time-ago';

@Component({
    selector: 'vessel-status-card',
    templateUrl: './vessel-status-card.component.html',
    imports: [TimeAgoComponent],
})
export class VesselStatusCardComponent {
    public vessel = input<Vessel>();
    public telemetry = input<TelemetryStatus[]>();

    public lastContact = computed(() => {
        const telemetry = this.telemetry();
        return telemetry?.sort((a, b) => Date.parse(b._time) - Date.parse(a._time))?.[0];
    });
}
