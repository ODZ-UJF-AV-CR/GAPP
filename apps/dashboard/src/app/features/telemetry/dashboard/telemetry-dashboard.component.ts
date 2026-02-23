import { ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import { LatencyService } from '@core/services/latency.service';
import { map } from 'rxjs';
import { TelemetryService } from '../telemetry.service';

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderContentDirective],
})
export class TelemetryDashboardComponent implements OnInit {
    private latencyService = inject(LatencyService);
    private telemetryService = inject(TelemetryService);
    private destroyRef = inject(DestroyRef);

    public latency = toSignal(this.latencyService.latency$(1_500).pipe(map((latency) => (latency ? `${latency} ms` : `no internet`))));

    public ngOnInit() {
        this.telemetryService
            .streamTelemetry$(['test_1'])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((telemetry) => console.log('Telemetry: ', telemetry));
    }
}
