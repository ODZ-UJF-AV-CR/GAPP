import { ClassRangeDirective, ClassRangeOptions } from '@/utils/class-range.directive';
import { timeDifference } from '@/utils/time-difference';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { TimeAgoComponent } from '@gapp/ui/time-ago';
import { interval, map, merge } from 'rxjs';

@Component({
    selector: 'time-ago-badge',
    template: `
        <span [class-range]="options" [value]="secondsAgo$ | async" class="badge">
            <time-ago [date]="date()"></time-ago>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoComponent, AsyncPipe, ClassRangeDirective],
})
export class TimeAgoBadgeComponent {
    public date = input<string>('');

    public options: ClassRangeOptions = {
        180: 'badge-success',
        360: 'badge-warning',
        3600: 'badge-error',
        100_000: 'badge-ghost',
    };

    public secondsAgo$ = merge(interval(1000), toObservable(this.date)).pipe(map(() => timeDifference(this.date())));
}
