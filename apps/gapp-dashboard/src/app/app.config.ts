import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
    providers: [provideExperimentalZonelessChangeDetection(), provideRouter(appRoutes), provideHttpClient(withFetch())],
};
