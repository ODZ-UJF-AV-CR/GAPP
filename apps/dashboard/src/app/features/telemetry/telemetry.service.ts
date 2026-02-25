import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import type { GenericTelemetry } from '@gapp/shared';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TelemetryService {
    private apiService = inject(ApiService);

    public streamTelemetry$(callsigns?: string[]) {
        return this.apiService.sse$<GenericTelemetry>(`/telemetry/stream?callsign=${callsigns?.join(',')}`);
    }

    public getLatestTelemetry$(callsigns?: string[]) {
        return this.apiService.get$<GenericTelemetry[]>(`/telemetry?callsign=${callsigns?.join(',')}`).pipe(map((response) => response.data || []));
    }
}
