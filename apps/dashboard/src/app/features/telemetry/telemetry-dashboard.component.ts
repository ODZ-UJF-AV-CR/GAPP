import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import { LatencyService } from '@core/services/latency.service';
import { map } from 'rxjs';

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderContentDirective],
})
export class TelemetryDashboardComponent {
    private latencyService = inject(LatencyService);

    public latency = toSignal(this.latencyService.latency$(1_500).pipe(map((latency) => (latency ? `${latency} ms` : `no internet`))));
}
