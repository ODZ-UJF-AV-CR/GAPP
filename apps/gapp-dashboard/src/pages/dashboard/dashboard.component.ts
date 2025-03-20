import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { PageBlockComponent } from '@/components/page-block/page-block.component';
import { ScrollableComponent } from '@gapp/ui/scrollable';
import { VehicleService, VehicleType } from '@/services/vehicle.service';
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

    public groundVehicles = computed(() => this.dashboardService.vehiclesWithTelemetry().filter((v) => v.type === VehicleType.CAR));
    public airVehicles = computed(() => this.dashboardService.vehiclesWithTelemetry().filter((v) => v.type !== VehicleType.CAR));

    public ngOnInit() {
        this.vehicleService.loadVehicles();
        this.dashboardService.init();
    }

    public ngOnDestroy() {
        this.dashboardService.deinit();
    }
}
