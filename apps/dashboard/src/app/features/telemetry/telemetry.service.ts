import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import type { DashboardStream } from '@gapp/shared';

@Injectable({ providedIn: 'root' })
export class TelemetryService {
    private apiService = inject(ApiService);

    public streamDashboard$(callsigns: string[]) {
        return this.apiService.sse$<DashboardStream>(`/live-data/dashboard?callsign=${callsigns.join(',')}`);
    }
}
