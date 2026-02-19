import { Component } from '@angular/core';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import { CenterLayoutComponent, SimpleSectionComponent, TripleSectionComponent } from '@shared/layout';

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    imports: [TripleSectionComponent, CenterLayoutComponent, SimpleSectionComponent, HeaderContentDirective],
})
export class TelemetryDashboardComponent {
    public text = 'asdasdadsdsa';
}
