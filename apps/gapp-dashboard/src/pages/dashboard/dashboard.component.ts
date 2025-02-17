import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, signal } from '@angular/core';
import { DashboardService, TelemetryStatus } from './dashboard.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs';
import { PageBlockComponent } from '@/components/page-block/page-block.component';
import { ScrollableComponent } from '@/components/scrollable/scrollable.component';
import { CarsService } from '@/services/cars.service';
import { VesselsService } from '@/services/vessels.service';
import { LoaderComponent } from '@/components/loader/loader.component';
import { CarStatusCardComponent } from './car-status-card.component';
import { VesselStatusCardComponent } from './vessel-status-card.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'dapp-dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageBlockComponent, ScrollableComponent, LoaderComponent, CarStatusCardComponent, VesselStatusCardComponent, AsyncPipe],
})
export class DashboardComponent {
    private dashboardService = inject(DashboardService);
    private carsService = inject(CarsService);
    private vesselsService = inject(VesselsService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    public telemetry = toSignal(this.dashboardService.dashboardStatus$().pipe(
      map((data) => data.sort((a, b) => Date.parse(b._time) - Date.parse(a._time)))
    ));

    public availableCars = toSignal(this.carsService.getCars$());
    public availableVessels = toSignal(this.vesselsService.getVessels$());

    constructor() {
        (window as any).dbg = this;
    }
}
