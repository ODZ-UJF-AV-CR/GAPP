import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextLimitDirective } from '@app/shared/utils';
import type { VehicleGet } from '@gapp/shared';
import { VehicleIconComponent } from '@shared/components/vehicle-icon/vehicle-icon.component';

@Component({
    selector: 'vehicle-list-item',
    templateUrl: './vehicle-list-item.component.html',
    imports: [TextLimitDirective, VehicleIconComponent, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleListItemComponent {
    public vehicle = input.required<VehicleGet>();
}
