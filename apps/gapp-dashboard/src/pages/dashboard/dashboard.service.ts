import { ApiServiceBase } from '@/services/api.service.base';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

    public getDashboardStatusStrem$() {
        const source = new EventSource(this.apiUrl('/telemetry/stream'));

        return new Observable((observer) => {
            source.onmessage = (message) => {
                console.log(message);
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
