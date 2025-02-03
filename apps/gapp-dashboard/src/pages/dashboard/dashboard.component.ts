import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'dapp-dashboard',
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);
    private destroyRef = inject(DestroyRef);

    public ngOnInit(): void {
        this.dashboardService
            .getDashboardStatusStrem$()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
                console.log(data);
            });
    }
}
