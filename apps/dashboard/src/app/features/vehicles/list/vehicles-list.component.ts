import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import { VehicleService } from '@shared/services';
import { LoaderComponent } from '@shared/utils';
import { CreateVehicleComponent } from '../create-vehicle/create-vehicle.component';
import { VehicleListItemComponent } from './vehicle-list-item.component';

@Component({
    selector: 'vehicles-list',
    templateUrl: './vehicles-list.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LoaderComponent, CreateVehicleComponent, VehicleListItemComponent, HeaderContentDirective],
})
export class VehiclesListComponent implements OnInit {
    private vehiclesService = inject(VehicleService);

    public loading = this.vehiclesService.vehiclesLoading;
    public vehicles = this.vehiclesService.vehiclesList;

    public ngOnInit() {
        this.vehiclesService.loadVehicles();
        this.vehiclesService.loadVehicleTypes();
    }
}
