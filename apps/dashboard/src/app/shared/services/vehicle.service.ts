import { computed, Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import type { VehicleCreate, VehicleGet, VehicleTypeGet, VehicleUpdate } from '@gapp/shared';
import { tap } from 'rxjs';
import { type ApiResponse, ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
    private apiService = inject(ApiService);

    private vehiclesResponse = signal<ApiResponse<VehicleGet[]>>({ loading: true });
    private vehicleTypesResponse = signal<ApiResponse<VehicleTypeGet[]>>({ loading: true });

    public vehiclesLoading = computed(() => this.vehiclesResponse().loading);
    public vehiclesList = computed(() => this.vehiclesResponse().data ?? []);
    public vehiclesList$ = toObservable(this.vehiclesList);

    public vehicleTypesLoading = computed(() => this.vehicleTypesResponse().loading);
    public vehicleTypesList = computed(() => this.vehicleTypesResponse().data ?? []);
    public vehicleTypesList$ = toObservable(this.vehicleTypesList);

    public createVehicle$(vehicle: VehicleCreate) {
        return this.apiService.post$<VehicleGet>('/vehicles', vehicle).pipe(
            tap(({ data }) => {
                if (data) {
                    this.vehiclesResponse.update((response) => ({ ...response, data: [...(response.data || []), data] }));
                }
            }),
        );
    }

    public updateVehicle$(id: number, vehicle: VehicleUpdate) {
        return this.apiService.patch$<VehicleGet>(`/vehicles/${id}`, vehicle).pipe(
            tap(({ data }) => {
                if (data) {
                    this.vehiclesResponse.update((response) => ({ ...response, data: response.data?.map((v) => (v.id === id ? { ...v, ...data } : v)) }));
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

    public getVehicle$(id: number, includeBeacons = true) {
        return this.apiService.get$<VehicleGet>(`/vehicles/${id}${includeBeacons ? '?includeBeacons=true' : ''}`);
    }

    public loadVehicles(includeBeacons = false) {
        this.apiService.get$<VehicleGet[]>(`/vehicles${includeBeacons ? '?includeBeacons=true' : ''}`).subscribe((data) => this.vehiclesResponse.set(data));
    }

    public loadVehicleTypes() {
        this.apiService.get$<VehicleTypeGet[]>('/vehicles/types').subscribe((data) => this.vehicleTypesResponse.set(data));
    }
}
