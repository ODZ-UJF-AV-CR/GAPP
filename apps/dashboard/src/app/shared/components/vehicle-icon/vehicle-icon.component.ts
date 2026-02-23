import { Component, computed, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { VEHICLE_ICONS } from './vehicle-icon.provider';

@Component({
    selector: 'vehicle-icon',
    template: `<ng-icon [svg]="icon()" [size]="size()"></ng-icon>`,
    imports: [NgIcon],
})
export class VehicleIconComponent {
    private iconsConfig = inject(VEHICLE_ICONS);

    public typeId = input.required<number>();
    public size = input.required<string>();

    public icon = computed(() => {
        const type = this.typeId();

        if (this.iconsConfig.icons.has(type)) {
            return this.iconsConfig.icons.get(type);
        }

        return this.iconsConfig.defaultIcon;
    });
}
