import { ChangeDetectionStrategy, Component, effect, input, type OnDestroy, signal } from '@angular/core';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-GB');

@Component({
    selector: '[time-ago]',
    template: `<ng-container>{{ time() }}</ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeAgoComponent implements OnDestroy {
    private intervalId?: ReturnType<typeof setInterval>;

    public date = input.required<Date | string>({ alias: 'time-ago' });
    public time = signal('');

    constructor() {
        effect(() => {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }

            const dateValue = this.date();
            const time = typeof dateValue === 'string' ? new Date(dateValue).getTime() : dateValue.getTime();

            const updateTime = () => this.time.set(timeAgo.format(time, 'round', { now: Date.now() }));
            this.intervalId = setInterval(updateTime, 1_000);
            updateTime();
        });
    }

    public ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
