import { Injectable, inject } from '@angular/core';
import { exhaustMap, filter, map, type Observable, of, take, timeout, timer } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class LatencyService {
    private apiService = inject(ApiService);

    public latency$(interval = 1_000, timeoutMs = 5_000): Observable<number | null> {
        return timer(0, interval).pipe(
            exhaustMap(() => {
                const start = performance.now();
                return this.apiService.ping$().pipe(
                    filter((res) => !res.loading),
                    take(1),
                    map(() => performance.now() - start),
                    timeout({ first: timeoutMs, with: () => of(null) }),
                );
            }),
        );
    }
}
