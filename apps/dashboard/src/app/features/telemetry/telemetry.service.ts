import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import type { TelemetryGet } from '@gapp/shared';

@Injectable({ providedIn: 'root' })
export class TelemetryService {
    private apiService = inject(ApiService);

    public streamTelemetry$(callsigns?: string[]) {
        return this.apiService.sse$<TelemetryGet>(`/telemetry/stream?callsign=${callsigns?.join(',')}`);
    }
}
