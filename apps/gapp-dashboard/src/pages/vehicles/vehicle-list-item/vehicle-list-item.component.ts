import { VehicleIconComponent } from '@/components/vehicle-icon/vehicle-icon.component';
import { ToastService } from '@/services/toast.service';
import { Vehicle, VehicleService } from '@/services/vehicle.service';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DialogDirective } from '@gapp/ui/dialog';
import { TextLimitDirective } from '@gapp/ui/utils';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerTrash } from '@ng-icons/tabler-icons';
import { filter } from 'rxjs';

@Component({
    selector: 'vehicle-list-item',
    templateUrl: './vehicle-list-item.component.html',
    imports: [NgIcon, TextLimitDirective, DialogDirective, VehicleIconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideIcons({ tablerTrash })],
})
export class VehicleListItemComponent {
    private vehicleServce = inject(VehicleService);
    private toastService = inject(ToastService);

    public vehicle = input.required<Vehicle>();

    public deleteVehicle() {
        this.vehicleServce
            .deleteVehicle$(this.vehicle().id)
            .pipe(filter((response) => !response.loading))
            .subscribe(() => {
                this.toastService.toast('alert-warning', `Vehicle ${this.vehicle().callsign} deleted.`);
            });
    }
}
