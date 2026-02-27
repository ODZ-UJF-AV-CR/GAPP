import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ClassRangeDirective, secondsFromDate, TimeAgoComponent } from '@shared/utils';
import { distinctUntilChanged, filter, interval, map, merge } from 'rxjs';
import type { BeaconWithTelemetry } from './telemetry-dashboard.component';

@Component({
    selector: 'beacon-row',
    templateUrl: './beacon-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoComponent, ClassRangeDirective, AsyncPipe],
})
export class BeaconRowComponent {
    public beacon = input.required<BeaconWithTelemetry>();

    public readonly badgeClasses = {
        180: 'badge-success',
        360: 'badge-warning',
        3600: 'badge-error',
    };

    public lastTimestamp = computed(() => this.beacon().telemetry()?._time);
    public altitude = computed(() => this.beacon().telemetry()?.altitude);

    public secondsAgo$ = merge(interval(1000), toObservable(this.lastTimestamp)).pipe(
        map(() => this.lastTimestamp()),
        filter((timestamp) => timestamp !== undefined),
        map((timestamp) => secondsFromDate(new Date(timestamp))),
        distinctUntilChanged(),
    );
}
