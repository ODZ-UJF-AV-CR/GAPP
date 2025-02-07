import { ChangeDetectionStrategy, Component, effect, input, OnDestroy, signal } from '@angular/core';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-GB');

@Component({
    selector: 'time-ago',
    template: `<ng-container>{{ time() }}</ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeAgoComponent implements OnDestroy {
    private intervalId?: number;

    public date = input('');
    public time = signal('');

    constructor() {
        effect(() => {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }

            const updateTime = () => this.time.set(timeAgo.format(new Date(this.date()), 'round', { now: Date.now() }));
            this.intervalId = setInterval(updateTime, 1_000) as unknown as number;
            updateTime();
        });
    }

    public ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
