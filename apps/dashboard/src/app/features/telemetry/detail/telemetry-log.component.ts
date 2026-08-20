import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import type { TelemetryLogEntry } from './vehicle-telemetry.store';

const ROW_HEIGHT_PX = 32;

@Component({
    selector: 'telemetry-log',
    templateUrl: './telemetry-log.component.html',
    host: { class: 'block w-full h-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ScrollingModule, DatePipe],
})
export class TelemetryLogComponent {
    private viewport = viewChild(CdkVirtualScrollViewport);

    public entries = input.required<TelemetryLogEntry[]>();
    public emptyMessage = input('No telemetry packets in the last 24 hours.');
    public selected = output<TelemetryLogEntry>();

    protected readonly rowHeight = ROW_HEIGHT_PX;

    /** @description The viewport keeps its offset when the list shrinks, which would leave the user below the last row */
    public scrollToTop() {
        this.viewport()?.scrollToIndex(0);
    }

    protected trackByKey(_index: number, entry: TelemetryLogEntry) {
        return entry.key;
    }
}
