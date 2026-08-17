import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { VehicleService } from '@shared/services';
import { VEHICLE_ICONS } from './vehicle-icon.provider';

@Component({
    selector: 'vehicle-icon',
    template: `<ng-icon [svg]="icon()" [size]="size()"></ng-icon>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgIcon],
})
export class VehicleIconComponent {
    private iconsConfig = inject(VEHICLE_ICONS);
    private vehicleService = inject(VehicleService);

    public typeId = input.required<number>();
    public size = input.required<string>();

    public icon = computed(() => {
        const typeName = this.vehicleService.vehicleTypesList().find((type) => type.id === this.typeId())?.type_name;

        return (typeName && this.iconsConfig.icons[typeName]) || this.iconsConfig.defaultIcon;
    });
}
