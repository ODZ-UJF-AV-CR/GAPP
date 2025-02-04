import { Component, DestroyRef, inject } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'dapp-dashboard',
    templateUrl: './dashboard.component.html',
    imports: [AsyncPipe],
})
export class DashboardComponent {
    private dashboardService = inject(DashboardService);
    private destroyRef = inject(DestroyRef);

    private telemetryData$ = this.dashboardService.dashboardStatus$().pipe(takeUntilDestroyed(this.destroyRef));

    public carsData$ = this.telemetryData$.pipe(
        map((data) => data.filter((d) => d._measurement === 'car_location')),
        map((data) => data.sort((a, b) => Date.parse(b._time) - Date.parse(a._time)))
    );
}
