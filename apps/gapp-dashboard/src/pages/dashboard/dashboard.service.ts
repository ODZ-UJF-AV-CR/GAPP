import { ApiServiceBase } from '@/services/api.service.base';
import { Injectable } from '@angular/core';

export interface TelemetryStatus {
    _time: string;
    altitude: number;
    callsign: string;
    latitude: number;
    longitude: number;
    result: string;
    table: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiServiceBase {
    public getDashboardStatus$() {
        return this.get$<TelemetryStatus>(this.apiUrl('/telemetry'));
    }
}
