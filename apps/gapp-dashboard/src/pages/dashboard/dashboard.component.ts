import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';

@Component({
    selector: 'dapp-dashboard',
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);

    public ngOnInit(): void {
        this.dashboardService.getDashboardStatus$().subscribe((data) => {
            console.log(data);
        });
    }
}
