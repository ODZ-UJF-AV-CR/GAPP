import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerAirBalloon, tablerCar, tablerDrone } from '@ng-icons/tabler-icons';
import { VehicleType } from '@/services/vehicle.service';

@Component({
    selector: 'vehicle-icon',
    template: `<ng-icon [name]="icon()" [size]="size()"></ng-icon>`,
    imports: [NgIcon],
    providers: [provideIcons({ tablerCar, tablerDrone, tablerAirBalloon })],
})
export class VehicleIconComponent {
    public type = input.required<VehicleType>();
    public size = input.required<string>();

    public icon = computed(() => {
        const type = this.type();

        if (type === VehicleType.CAR) {
            return 'tablerCar';
        } else if (type === VehicleType.BALLOON) {
            return 'tablerAirBalloon';
        } else if (type === VehicleType.DRONE) {
            return 'tablerDrone';
        }

        return 'tablerBalloon';
    });
}
