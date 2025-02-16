import { Car } from '@/services/cars.service';
import { Component, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'car-status-card',
    templateUrl: './car-status-card.component.html',
    imports: [JsonPipe],
})
export class CarStatusCardComponent {
    public car = input<Car>();
    public telemetry = input<TelemetryStatus[] | null>();
}
