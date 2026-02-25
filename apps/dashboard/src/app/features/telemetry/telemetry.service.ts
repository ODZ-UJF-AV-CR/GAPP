import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import type { GenericTelemetry } from '@gapp/shared';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TelemetryService {
    private apiService = inject(ApiService);

    public streamTelemetry$(callsigns?: string[]) {
        console.log('Streaming started');
        return this.apiService.sse$<GenericTelemetry>(`/telemetry/stream?callsign=${callsigns?.join(',')}`);
    }

    public getLatestTelemetry$(callsigns?: string[]) {
        console.log('Getting last telemetry');
        return this.apiService.get$<GenericTelemetry[]>(`/telemetry?callsign=${callsigns?.join(',')}`).pipe(map((response) => response.data || []));
    }
}
