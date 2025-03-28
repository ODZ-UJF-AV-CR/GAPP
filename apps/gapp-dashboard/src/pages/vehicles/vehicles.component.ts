import { PageBlockComponent } from '@/components/page-block/page-block.component';
import { VehicleService } from '@/services/vehicle.service';
import { Component, inject, OnInit } from '@angular/core';
import { LoaderComponent } from '@gapp/ui/loader';
import { ScrollableComponent } from '@gapp/ui/scrollable';
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
