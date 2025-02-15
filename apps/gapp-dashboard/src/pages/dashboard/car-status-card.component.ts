import { Car } from '@/services/cars.service';
import { Component, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';

@Component({
    selector: 'car-status-card',
    templateUrl: './car-status-card.component.html',
})
export class CarStatusCardComponent {
    public car = input<Car>();
    public telemetry = input<TelemetryStatus>();
}
