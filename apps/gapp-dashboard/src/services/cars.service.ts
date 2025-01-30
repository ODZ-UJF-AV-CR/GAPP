import { Injectable } from '@angular/core';
import { ApiServiceBase } from './api.service.base';

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
}
