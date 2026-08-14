import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ClassRangeDirective, secondsFromDate, TimeAgoComponent } from '@shared/utils';
import { distinctUntilChanged, filter, interval, map, merge } from 'rxjs';
import type { BeaconWithContact } from './telemetry-dashboard.component';

@Component({
    selector: 'beacon-row',
    templateUrl: './beacon-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoComponent, ClassRangeDirective, AsyncPipe],
})
export class BeaconRowComponent {
    public beacon = input.required<BeaconWithContact>();
    public isStation = input<boolean>(false);

    public readonly badgeClasses = {
        180: 'badge-success',
        360: 'badge-warning',
        3600: 'badge-error',
    };

    public contactTimestamp = computed(() => this.beacon().contact()?._time);
    public uploaderCallsign = computed(() => this.beacon().contact()?.uploader_callsign);
    public uploadTimestamp = computed(() => this.beacon().upload()?._time);

    public contactSecondsAgo$ = this.secondsAgo$(this.contactTimestamp);
    public uploadSecondsAgo$ = this.secondsAgo$(this.uploadTimestamp);

    private secondsAgo$(timestamp: Signal<string | undefined>) {
        return merge(interval(1000), toObservable(timestamp)).pipe(
            map(() => timestamp()),
            filter((value) => value !== undefined),
            map((value) => secondsFromDate(new Date(value))),
            distinctUntilChanged(),
        );
    }
}
