import { Component, computed, input } from '@angular/core';
import { TelemetryStatus } from './dashboard.service';
import { Vessel } from '@/services/vessels.service';
import { TimeAgoComponent } from '@gapp/ui/time-ago';
import { ClassRangeDirective, ClassRangeOptions } from '@/utils/class-range.directive';
import { AsyncPipe } from '@angular/common';
import { timeDifference } from '@/utils/time-difference';
import { interval, map, merge } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
    selector: 'vessel-status-card',
    templateUrl: './vessel-status-card.component.html',
    imports: [TimeAgoComponent, ClassRangeDirective, AsyncPipe],
})
export class VesselStatusCardComponent {
    public vessel = input<Vessel>();
    public telemetry = input<TelemetryStatus[]>();

    public lastContact = computed(() => {
        const telemetry = this.telemetry();
        return telemetry?.sort((a, b) => Date.parse(b._time) - Date.parse(a._time))?.[0];
    });

    public options: ClassRangeOptions = {
        180: 'badge-success',
        360: 'badge-warning',
        10_000: 'badge-error',
    };

    public secondsAgo$ = merge(interval(1000), toObservable(this.lastContact)).pipe(map(() => timeDifference(this.lastContact()?._time)));
}
