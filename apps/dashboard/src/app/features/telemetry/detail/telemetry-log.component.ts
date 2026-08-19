import { ScrollingModule } from '@angular/cdk/scrolling';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
    public entries = input.required<TelemetryLogEntry[]>();
    public selected = output<TelemetryLogEntry>();

    protected readonly rowHeight = ROW_HEIGHT_PX;

    protected trackByKey(_index: number, entry: TelemetryLogEntry) {
        return entry.key;
    }
}
