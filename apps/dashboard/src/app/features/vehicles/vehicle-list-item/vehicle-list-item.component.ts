import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { type Vehicle, VehicleService } from '@app/features/vehicles/vehicle.service';
import { ToastService } from '@core/services/toast.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerTrash } from '@ng-icons/tabler-icons';
import { VehicleIconComponent } from '@shared/components/vehicle-icon/vehicle-icon.component';
import { type DialogButton, DialogDirective, TextLimitDirective } from '@shared/ui';
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

    public buttons: DialogButton[] = [
        {
            label: 'Close',
            style: 'btn-neutral',
            close: true,
        },
        {
            label: 'Delete',
            style: 'btn-error',
            action: () => this.deleteVehicle(),
        },
    ];

    public deleteVehicle() {
        this.vehicleServce
            .deleteVehicle$(this.vehicle().id)
            .pipe(filter((response) => !response.loading))
            .subscribe(() => {
                this.toastService.toast('alert-warning', `Vehicle ${this.vehicle().callsign} deleted.`);
            });
    }
}
