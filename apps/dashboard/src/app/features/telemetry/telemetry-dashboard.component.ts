import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderContentDirective],
})
export class TelemetryDashboardComponent {
    public text = 'asdasdadsdsa';
}
