import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DashboardService, TelemetryStatus } from './dashboard.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TimeAgoComponent } from '@/components/time-ago/time-ago.component';
import { PageBlockComponent } from '@/components/page-block/page-block.component';
import { ScrollableComponent } from '@/components/scrollable/scrollable.component';
import { CarsService } from '@/services/cars.service';
import { VesselsService } from '@/services/vessels.service';

@Component({
    selector: 'dapp-dashboard',
    templateUrl: './dashboard.component.html',
    imports: [TimeAgoComponent, PageBlockComponent, ScrollableComponent],
})
export class DashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);
    private carsService = inject(CarsService);
    private vesselsService = inject(VesselsService);
    private destroyRef = inject(DestroyRef);

    public readonly cars = signal<TelemetryStatus[]>([]);
    public readonly vessels = signal<TelemetryStatus[]>([]);

    public ngOnInit() {
        this.dashboardService
            .dashboardStatus$()
            .pipe(
                map((data) => data.sort((a, b) => Date.parse(b._time) - Date.parse(a._time))),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((data) => {
                this.cars.set(data.filter((d) => d._measurement === 'car_location'));
                this.vessels.set(data.filter((d) => d._measurement === 'vessel_location'));
            });
    }
}
