import { inject } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, startWith } from 'rxjs';

export interface ApiResponse<T> {
    loading: boolean;
    data?: T;
    error?: Error;
}

export abstract class ApiServiceBase {
    private http = inject(HttpClient);

    protected apiUrl(path: string) {
        return `${environment.apiBaseUrl}${path}`;
    }

    protected post$<T>(url: string, body: any | null): Observable<ApiResponse<T>> {
        return this.http.post<T>(url, body).pipe(
            map((data) => ({ loading: false, data })),
            catchError((error) => of({ loading: false, error })),
            startWith({ loading: true })
        );
    }

    protected get$<T>(url: string): Observable<ApiResponse<T>> {
        return this.http.get<T>(url).pipe(
            map((data) => ({ loading: false, data })),
            catchError((error) => of({ loading: false, error })),
            startWith({ loading: true })
        );
    }
}
