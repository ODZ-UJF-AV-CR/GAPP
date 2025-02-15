import { Component, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { Vessel } from '@/services/vessels.service';

@Component({
    selector: 'vessel-status-card',
    templateUrl: './vessel-status-card.component.html',
})
export class VesselStatusCardComponent {
    public vessel = input<Vessel>();
    public telemetry = input<TelemetryStatus[]>();
}
