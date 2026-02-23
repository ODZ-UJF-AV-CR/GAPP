import { computed, Injectable, inject, signal } from '@angular/core';
import type { VehicleCreate, VehicleGet, VehicleTypeGet } from '@gapp/shared';
import { tap } from 'rxjs';
import { type ApiResponse, ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
    private apiService = inject(ApiService);

    private vehiclesResponse = signal<ApiResponse<VehicleGet[]>>({ loading: true });
    private vehicleTypesResponse = signal<ApiResponse<VehicleTypeGet[]>>({ loading: true });

    public vehiclesLoading = computed(() => this.vehiclesResponse().loading);
    public vehiclesList = computed(() => this.vehiclesResponse().data ?? []);

    public vehicleTypesLoading = computed(() => this.vehicleTypesResponse().loading);
    public vehicleTypesList = computed(() => this.vehicleTypesResponse().data ?? []);

    public createVehicle$(vehicle: VehicleCreate) {
        return this.apiService.post$<VehicleGet>('/vehicles', vehicle).pipe(
            tap(({ data }) => {
                if (data) {
                    this.vehiclesResponse.update((response) => ({ ...response, data: [...(response.data || []), data] }));
                }
            }),
        );
    }

    public deleteVehicle$(id: number) {
        return this.apiService.delete$(`/vehicles/${id}`).pipe(
            tap(({ data }) => {
                if (data === null) {
                    this.vehiclesResponse.update((response) => ({ ...response, data: response.data?.filter((v) => v.id !== id) }));
                }
            }),
        );
    }

    public loadVehicles() {
        this.apiService.get$<VehicleGet[]>('/vehicles').subscribe((data) => this.vehiclesResponse.set(data));
    }

    public loadVehicleTypes() {
        this.apiService.get$<VehicleTypeGet[]>('/vehicles/types').subscribe((data) => this.vehicleTypesResponse.set(data));
    }
}
