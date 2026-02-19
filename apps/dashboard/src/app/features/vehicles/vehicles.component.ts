import { Component, inject, type OnInit } from '@angular/core';
import { CenterLayoutComponent, SimpleSectionComponent } from '@shared/layout';
import { VehicleService } from '@shared/services';
import { LoaderComponent, ScrollableComponent } from '@shared/utils';
import { CreateVehicleComponent } from './create-vehicle/create-vehicle.component';
import { VehicleListItemComponent } from './vehicle-list-item/vehicle-list-item.component';

@Component({
    selector: 'app-vehicles',
    templateUrl: './vehicles.component.html',
    imports: [SimpleSectionComponent, ScrollableComponent, LoaderComponent, CreateVehicleComponent, VehicleListItemComponent, CenterLayoutComponent],
})
export class VehiclesComponent implements OnInit {
    private vehiclesService = inject(VehicleService);

    public loading = this.vehiclesService.vehiclesLoading;
    public vehicles = this.vehiclesService.vehiclesList;

    public ngOnInit() {
        this.vehiclesService.loadVehicles();
    }
}
