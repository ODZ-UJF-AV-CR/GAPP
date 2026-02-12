import { provideHttpClient, withFetch } from '@angular/common/http';
import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [provideZonelessChangeDetection(), provideRouter(routes), provideHttpClient(withFetch())],
};
