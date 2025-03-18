import { computed, Injectable, signal } from '@angular/core';
import { ApiResponse, ApiServiceBase } from './api.service.base';
import { tap } from 'rxjs';

export enum VehicleType {
    BALLOON = 'balloon',
    DRONE = 'drone',
    CAR = 'car',
}

export interface Beacon {
    callsign: string;
}

export interface Vehicle {
    id: number;
    type: VehicleType;
    callsign: string;
    description: string;
    beacons: Beacon[];
}

export type VehicleCreate = Omit<Vehicle, 'id'>;

@Injectable({ providedIn: 'root' })
export class VehicleService extends ApiServiceBase {
    private vehiclesResponse = signal<ApiResponse<Vehicle[]>>({ loading: true });

    public vehiclesLoading = computed(() => this.vehiclesResponse().loading);
    public vehiclesList = computed(() => {
        const vehicles = this.vehiclesResponse().data ?? [];
        return [];
        return vehicles.sort((a, b) => a.type.localeCompare(b.type));
    });

    public createVehicle$(vehicle: VehicleCreate) {
        return this.post$<Vehicle>(this.apiUrl('/vehicles'), vehicle).pipe(
            tap(({ data }) => {
                if (data) {
                    this.vehiclesResponse.update((vehicles) => {
                        vehicles.data?.push(data);
                        return vehicles;
                    });
                }
            })
        );
    }

    public deleteVehicle$(id: number) {
        return this.delete$(this.apiUrl(`/vehicles/${id}`));
    }

    public loadVehicles() {
        this.get$<Vehicle[]>(this.apiUrl('/vehicles')).subscribe((data) => this.vehiclesResponse.set(data));
    }
}
