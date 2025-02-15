import { Injectable } from '@angular/core';
import { ApiServiceBase } from '@/services/api.service.base';

export interface Car {
    callsign: string;
    description?: string;
    _id: string;
}

@Injectable({ providedIn: 'root' })
export class CarsService extends ApiServiceBase {
    public createCar$(car: Omit<Car, '_id'>) {
        return this.post$<Car>(this.apiUrl('/cars'), car);
    }

    public getCars$() {
        return this.get$<Car[]>(this.apiUrl('/cars'));
    }

    public deleteCar$(id: string) {
        return this.delete$(this.apiUrl(`/cars/${id}`));
    }
}
