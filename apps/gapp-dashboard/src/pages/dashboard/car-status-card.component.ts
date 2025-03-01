import { Car } from '@/services/cars.service';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { TimeAgoBadgeComponent } from '@/components/time-ago-badge/time-ago-badge.component';

@Component({
    selector: 'car-status-card',
    templateUrl: './car-status-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoBadgeComponent],
    // providers: [provideIcons({ tablerExternalLink })],
})
export class CarStatusCardComponent {
    public car = input<Car>();
    public telemetry = input<TelemetryStatus>();
}
