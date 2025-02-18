import { Component, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { Vessel } from '@/services/vessels.service';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'vessel-status-card',
    templateUrl: './vessel-status-card.component.html',
    imports: [JsonPipe],
})
export class VesselStatusCardComponent {
    public vessel = input<Vessel>();
    public telemetry = input<TelemetryStatus[]>();
}
