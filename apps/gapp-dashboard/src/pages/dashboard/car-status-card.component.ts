import { Car } from '@/services/cars.service';
import { Component, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { TimeAgoComponent } from '@gapp/ui/time-ago';

@Component({
    selector: 'car-status-card',
    templateUrl: './car-status-card.component.html',
    imports: [TimeAgoComponent],
})
export class CarStatusCardComponent {
    public car = input<Car>();
    public telemetry = input<TelemetryStatus>();
}
