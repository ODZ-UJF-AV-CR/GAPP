import { Component } from '@angular/core';
import { CenterLayoutComponent, SimpleSectionComponent, TripleSectionComponent } from '@shared/layout';

@Component({
    selector: 'telemetry-dashboard',
    templateUrl: './telemetry-dashboard.component.html',
    imports: [TripleSectionComponent, CenterLayoutComponent, SimpleSectionComponent],
})
export class TelemetryDashboardComponent {}
