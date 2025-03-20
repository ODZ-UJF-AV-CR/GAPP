import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BeaconWithTelemetry } from '../dashboard.service';
import { ClassRangeDirective, ClassRangeOptions, timeDifference } from '@gapp/ui/utils';
import { AsyncPipe } from '@angular/common';
import { distinctUntilChanged, interval, map, merge } from 'rxjs';
import { TimeAgoComponent } from '@gapp/ui/time-ago';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
    selector: 'beacon-item',
    templateUrl: './beacon-item.component.html',
    styleUrls: ['./beacon-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, ClassRangeDirective, TimeAgoComponent],
})
export class BeaconItemComponent {
    public beacon = input.required<BeaconWithTelemetry>();

    public backgroundClasses: ClassRangeOptions = {
        0: 'bg-base-200',
        180: 'bg-success',
        360: 'bg-warning',
        3600: 'bg-error',
        100_000: 'bg-base-200',
    };

    public textClasses: ClassRangeOptions = {
        0: 'text-base-200-content',
        180: 'text-success-content',
        360: 'text-warning-content',
        3600: 'text-error-content',
        100_000: 'text-base-200-content',
    };

    public secondsAgo$ = merge(interval(1000), toObservable(this.beacon)).pipe(
        map(() => {
            const telemetry = this.beacon().telemetry;
            return telemetry ? timeDifference(telemetry._time) : null;
        }),
        distinctUntilChanged()
    );
}
