import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PageBlockComponent } from '@/components/page-block/page-block.component';
import { ScrollableComponent } from '@/components/scrollable/scrollable.component';
import { CarsService } from '@/services/cars.service';
import { VesselsService } from '@/services/vessels.service';
import { LoaderComponent } from '@gapp/ui/loader';
import { CarStatusCardComponent } from './car-status-card.component';
import { VesselStatusCardComponent } from './vessel-status-card.component';

@Component({
    selector: 'dapp-dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageBlockComponent, ScrollableComponent, LoaderComponent, CarStatusCardComponent, VesselStatusCardComponent],
})
export class DashboardComponent {
    private dashboardService = inject(DashboardService);
    private carsService = inject(CarsService);
    private vesselsService = inject(VesselsService);

    public telemetry = toSignal(this.dashboardService.dashboardStatus$().pipe(map((data) => data.sort((a, b) => Date.parse(b._time) - Date.parse(a._time)))));

    public availableCars = toSignal(this.carsService.getCars$());
    public availableVessels = toSignal(this.vesselsService.getVessels$());

    public getTelemetry(callsigns: string[]) {
        return computed(() => {
            return this.telemetry()?.filter((t) => callsigns.includes(t.callsign));
        });
    }
}
