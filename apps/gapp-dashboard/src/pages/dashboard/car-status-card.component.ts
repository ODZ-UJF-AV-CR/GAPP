import { Car } from '@/services/cars.service';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { TimeAgoBadgeComponent } from '@/components/time-ago-badge/time-ago-badge.component';
import { DialogComponent } from '@gapp/ui/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerExternalLink } from '@ng-icons/tabler-icons';
import { TextLimitDirective } from '@gapp/ui/utils';

@Component({
    selector: 'car-status-card',
    templateUrl: './car-status-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoBadgeComponent, DialogComponent, NgIcon, TextLimitDirective],
    providers: [provideIcons({ tablerExternalLink })],
})
export class CarStatusCardComponent {
    public car = input.required<Car>();
    public telemetry = input<TelemetryStatus>();
}
