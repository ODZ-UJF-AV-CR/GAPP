import { ApiServiceBase } from '@/services/api.service.base';
import { Car } from '@/services/cars.service';
import { Vessel } from '@/services/vessels.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TelemetryStatus {
    _time: string;
    _measurement: 'car_location' | 'vessel_location';
    altitude: number;
    callsign: string;
    latitude: number;
    longitude: number;
}

export type CarStatus = { telemetry: TelemetryStatus; car: Car };
export type VesselStatus = { telemetry: TelemetryStatus[]; vessel: Vessel };

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiServiceBase {
    public getDashboardStatus$() {
        return this.get$<TelemetryStatus>(this.apiUrl('/telemetry'));
    }

    public dashboardStatus$(callsigns: string[]): Observable<TelemetryStatus[]> {
        const source = new EventSource(this.apiUrl(`/telemetry/stream?callsigns=${callsigns.join(',')}`));

        return new Observable((observer) => {
            source.onmessage = (message) => {
                if (message.data !== 'ping') {
                    observer.next(JSON.parse(message.data));
                }
            };

            return () => {
                source.close();
            };
        });
    }
}
