import { ChangeDetectionStrategy, Component, computed, inject, input, type Signal } from '@angular/core';
import { TICKER } from '@core/services/ticker.provider';
import { ClassRangeDirective, secondsFromDate, TimeAgoComponent } from '@shared/utils';
import type { BeaconWithContact } from './telemetry-dashboard.component';

@Component({
    selector: 'beacon-row',
    templateUrl: './beacon-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TimeAgoComponent, ClassRangeDirective],
})
export class BeaconRowComponent {
    private ticker = inject(TICKER);

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

    public contactSecondsAgo = this.secondsAgo(this.contactTimestamp);
    public uploadSecondsAgo = this.secondsAgo(this.uploadTimestamp);

    private secondsAgo(timestamp: Signal<string | undefined>) {
        return computed(() => {
            this.ticker();
            const value = timestamp();

            return value ? secondsFromDate(new Date(value)) : undefined;
        });
    }
}
