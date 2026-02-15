import { Component, inject, type OnInit } from '@angular/core';
import { PageBlockComponent } from '@shared/components/page-block/page-block.component';
import { VehicleService } from '@shared/services';
import { LoaderComponent, ScrollableComponent } from '@shared/utils';
import { CreateVehicleComponent } from './create-vehicle/create-vehicle.component';
import { VehicleListItemComponent } from './vehicle-list-item/vehicle-list-item.component';

@Component({
    selector: 'app-vehicles',
    templateUrl: './vehicles.component.html',
    imports: [PageBlockComponent, ScrollableComponent, LoaderComponent, CreateVehicleComponent, VehicleListItemComponent],
})
export class VehiclesComponent implements OnInit {
    private vehiclesService = inject(VehicleService);

    public loading = this.vehiclesService.vehiclesLoading;
    public vehicles = this.vehiclesService.vehiclesList;

    public ngOnInit() {
        this.vehiclesService.loadVehicles();
    }
}
