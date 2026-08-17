import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, map, Observable, of, startWith } from 'rxjs';

export interface ApiResponse<T> {
    loading: boolean;
    data?: T;
    error?: {
        type: string;
        message: string;
    };
}

export type SseStatus = 'idle' | 'connecting' | 'live' | 'reconnecting';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);

    private apiUrl(path: string) {
        return `${environment.apiBaseUrl}${path}`;
    }

    /**
     * Keepalives arrive as SSE comments, so they never reach onmessage. Transient drops are left to the
     * browser, which reconnects on its own, only a closed connection is surfaced as an error to be retried.
     */
    public sse$<T>(url: string, onStatus?: (status: SseStatus) => void): Observable<T> {
        return new Observable((observer) => {
            const source = new EventSource(this.apiUrl(url));
            onStatus?.('connecting');

            source.onopen = () => onStatus?.('live');

            source.onmessage = (message) => {
                try {
                    observer.next(JSON.parse(message.data) as T);
                } catch (error) {
                    console.error('Malformed SSE message', error);
                }
            };

            source.onerror = () => {
                onStatus?.('reconnecting');

                if (source.readyState === EventSource.CLOSED) {
                    observer.error(new Error(`SSE connection to ${url} was closed`));
                }
            };

            return () => {
                source.close();
                onStatus?.('idle');
            };
        });
    }

    public post$<T>(url: string, body: unknown | null): Observable<ApiResponse<T>> {
        return this.http.post<T>(this.apiUrl(url), body).pipe(
            map((data) => ({ loading: false, data })),
            catchError(({ error }) =>
                of({
                    loading: false,
                    error: {
                        type: error.error,
                        message: error.message,
                    },
                }),
            ),
            startWith({ loading: true }),
        );
    }

    public patch$<T>(url: string, body: unknown | null): Observable<ApiResponse<T>> {
        return this.http.patch<T>(this.apiUrl(url), body).pipe(
            map((data) => ({ loading: false, data })),
            catchError(({ error }) =>
                of({
                    loading: false,
                    error: {
                        type: error.error,
                        message: error.message,
                    },
                }),
            ),
            startWith({ loading: true }),
        );
    }

    public get$<T>(url: string): Observable<ApiResponse<T>> {
        return this.http.get<T>(this.apiUrl(url)).pipe(
            map((data) => ({ loading: false, data })),
            catchError(({ error }) =>
                of({
                    loading: false,
                    error: {
                        type: error.error,
                        message: error.message,
                    },
                }),
            ),
            startWith({ loading: true }),
        );
    }

    public delete$<T>(url: string): Observable<ApiResponse<T>> {
        return this.http.delete<T>(this.apiUrl(url)).pipe(
            map((data) => ({ loading: false, data })),
            catchError(({ error }) =>
                of({
                    loading: false,
                    error: {
                        type: error.error,
                        message: error.message,
                    },
                }),
            ),
            startWith({ loading: true }),
        );
    }
}
