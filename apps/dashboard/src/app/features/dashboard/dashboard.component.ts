import { ChangeDetectionStrategy, Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { SimpleSectionComponent } from '@shared/layout';
import { VehicleService } from '@shared/services';
import { ScrollableComponent } from '@shared/utils';
import { DashboardService } from './dashboard.service';
import { TelemetryCardComponent } from './telemetry-card/telemetry-card.component';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SimpleSectionComponent, ScrollableComponent, TelemetryCardComponent],
})
export class DashboardComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private vehicleService = inject(VehicleService);

    public telemetry = this.dashboardService.vehiclesWithTelemetry;

    public ngOnInit() {
        this.vehicleService.loadVehicles();
        this.dashboardService.init();
    }

    public ngOnDestroy() {
        this.dashboardService.deinit();
    }
}
