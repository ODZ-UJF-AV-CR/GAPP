import { ToastService } from '@/services/toast.service';
import { Vehicle, VehicleService, VehicleType } from '@/services/vehicle.service';
import { Component, computed, inject, input } from '@angular/core';
import { DialogDirective } from '@gapp/ui/dialog';
import { TextLimitDirective } from '@gapp/ui/utils';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBalloon, tablerCar, tablerDrone, tablerTrash } from '@ng-icons/tabler-icons';
import { filter } from 'rxjs';

@Component({
    selector: 'vehicle-list-item',
    templateUrl: './vehicle-list-item.component.html',
    imports: [NgIcon, TextLimitDirective, DialogDirective],
    providers: [provideIcons({ tablerCar, tablerDrone, tablerBalloon, tablerTrash })],
})
export class VehicleListItemComponent {
    private vehicleServce = inject(VehicleService);
    private toastService = inject(ToastService);

    public vehicle = input.required<Vehicle>();

    public icon = computed(() => {
        const type = this.vehicle().type;

        if (type === VehicleType.CAR) {
            return 'tablerCar';
        } else if (type === VehicleType.BALLOON) {
            return 'tablerBalloon';
        } else if (type === VehicleType.DRONE) {
            return 'tablerDrone';
        }

        return 'tablerBalloon';
    });

    public deleteVehicle() {
        this.vehicleServce
            .deleteVehicle$(this.vehicle().id)
            .pipe(filter((response) => !response.loading))
            .subscribe(() => {
                this.toastService.toast('alert-warning', `Vehicle ${this.vehicle().callsign} deleted.`);
            });
    }
}
