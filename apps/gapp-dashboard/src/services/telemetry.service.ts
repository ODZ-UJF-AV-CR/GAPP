import { Injectable } from '@angular/core';
import { ApiServiceBase } from './api.service.base';
import { Observable } from 'rxjs';

export interface TelemetryData {
    _time: Date;
    altitude: number;
    callsign: string;
    latitude: number;
    longitude: number;
}

@Injectable({ providedIn: 'root' })
export class TelemetryService extends ApiServiceBase {
    public latestData$(): Observable<TelemetryData[]> {
        const source = new EventSource(this.apiUrl(`/telemetry/stream`));

        return new Observable((observer) => {
            source.onmessage = (message) => {
                if (message.data !== 'ping') {
                    const data = JSON.parse(message.data) as TelemetryData[];
                    observer.next(
                        data.map((t) => ({
                            ...t,
                            _time: new Date(t._time),
                        }))
                    );
                }
            };

            source.onerror = (error) => {
                console.error(error);
            };

            return () => {
                source.close();
            };
        });
    }
}
