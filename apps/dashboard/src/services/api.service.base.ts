import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, type Observable, of, startWith } from 'rxjs';
import { environment } from '../environment/environment';

export interface ApiResponse<T> {
    loading: boolean;
    data?: T;
    error?: {
        type: string;
        message: string;
    };
}

export abstract class ApiServiceBase {
    private http = inject(HttpClient);

    protected apiUrl(path: string) {
        return `${environment.apiBaseUrl}${path}`;
    }

    protected post$<T>(url: string, body: unknown | null): Observable<ApiResponse<T>> {
        return this.http.post<T>(url, body).pipe(
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

    protected get$<T>(url: string): Observable<ApiResponse<T>> {
        return this.http.get<T>(url).pipe(
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

    protected delete$<T>(url: string): Observable<ApiResponse<T>> {
        return this.http.delete<T>(url).pipe(
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
