import { Car } from '@/services/cars.service';
import { Component, input } from '@angular/core';

@Component({
    selector: 'car-tab',
    templateUrl: './car-tab.component.html',
})
export class CarTabComponent {
    public readonly car = input<Car>();
}
