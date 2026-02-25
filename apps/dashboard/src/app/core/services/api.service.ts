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

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);

    private apiUrl(path: string) {
        return `${environment.apiBaseUrl}${path}`;
    }

    public sse$<T>(url: string): Observable<T> {
        const source = new EventSource(this.apiUrl(url));

        return new Observable((observer) => {
            source.onmessage = (message) => {
                try {
                    const data = JSON.parse(message.data);
                    if (data?.data !== 'ping') {
                        observer.next(data);
                    }
                } catch (error) {
                    console.error(error);
                    observer.error(error);
                }
            };

            source.onerror = (error) => {
                console.error(error);
                observer.error(error);
            };

            return () => {
                source.close();
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

    public ping$(): Observable<ApiResponse<unknown>> {
        return this.get$('/ping');
    }
}
