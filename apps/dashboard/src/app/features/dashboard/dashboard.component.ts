import { ChangeDetectionStrategy, Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { VehicleService } from '@app/features/vehicles/vehicle.service';
import { PageBlockComponent } from '@shared/components/page-block/page-block.component';
import { ScrollableComponent } from '@shared/ui';
import { DashboardService } from './dashboard.service';
import { TelemetryCardComponent } from './telemetry-card/telemetry-card.component';

@Component({
    selector: 'dapp-dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageBlockComponent, ScrollableComponent, TelemetryCardComponent],
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
