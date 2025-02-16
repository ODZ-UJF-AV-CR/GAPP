import { Component, DestroyRef, inject } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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
    imports: [PageBlockComponent, ScrollableComponent, LoaderComponent, CarStatusCardComponent, VesselStatusCardComponent, AsyncPipe],
})
export class DashboardComponent {
    private dashboardService = inject(DashboardService);
    private carsService = inject(CarsService);
    private vesselsService = inject(VesselsService);
    private destroyRef = inject(DestroyRef);

    private telemetry$ = this.dashboardService.dashboardStatus$().pipe(
        map((data) => data.sort((a, b) => Date.parse(b._time) - Date.parse(a._time))),
        takeUntilDestroyed(this.destroyRef)
    );

    public availableCars = toSignal(this.carsService.getCars$());
    public availableVessels = toSignal(this.vesselsService.getVessels$());

    public filterTelemetry$(callsigns: string[]) {
        console.log(callsigns.join(' '));
        return this.telemetry$.pipe(map((data) => data.filter((item) => callsigns.includes(item.callsign))));
    }
}
