import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ToastService } from '@app/core/toasts';
import { type DialogButton, DialogDirective } from '@app/shared/dialog';
import { TextLimitDirective } from '@app/shared/utils';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerTrash } from '@ng-icons/tabler-icons';
import { VehicleIconComponent } from '@shared/components/vehicle-icon/vehicle-icon.component';
import { type Vehicle, VehicleService } from '@shared/services';
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
