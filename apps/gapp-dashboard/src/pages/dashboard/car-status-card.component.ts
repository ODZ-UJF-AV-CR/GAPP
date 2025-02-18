import { Car } from '@/services/cars.service';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { TimeAgoComponent } from '@gapp/ui/time-ago';
import { ClassRangeDirective, ClassRangeOptions } from '@/utils/class-range.directive';
import { interval, map, merge } from 'rxjs';
import { timeDifference } from '@/utils/time-difference';
import { AsyncPipe } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
    selector: 'car-status-card',
    templateUrl: './car-status-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoComponent, ClassRangeDirective, AsyncPipe],
})
export class CarStatusCardComponent {
    public car = input<Car>();
    public telemetry = input<TelemetryStatus>();

    public options: ClassRangeOptions = {
        180: 'badge-success',
        360: 'badge-warning',
        3600: 'badge-error',
        100_000: 'badge-ghost',
    };

    public secondsAgo$ = merge(interval(1000), toObservable(this.telemetry)).pipe(map(() => timeDifference(this.telemetry()?._time)));
}
