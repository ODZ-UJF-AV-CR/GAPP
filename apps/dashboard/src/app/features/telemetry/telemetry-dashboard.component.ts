import { Component } from '@angular/core';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    imports: [HeaderContentDirective],
})
export class TelemetryDashboardComponent {
    public text = 'asdasdadsdsa';
}
