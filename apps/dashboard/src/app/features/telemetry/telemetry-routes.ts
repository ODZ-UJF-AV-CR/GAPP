import type { GappRoutes } from '@app/app.routes';
import { useHeader } from '@core/components/header/header-builder';

export const TELEMETRY_ROUTES: GappRoutes = [
    {
        path: '',
        loadComponent: () => import('./telemetry-dashboard.component').then((c) => c.TelemetryDashboardComponent),
        title: 'GAPP | Telemetry',
        data: {
            ...useHeader('Test'),
        },
    },
    {
        path: ':vehicleId',
        loadComponent: () => import('./telemetry-detail.component').then((c) => c.TelemetryDetailComponent),
        title: 'GAPP | Telemetry detail',
    },
];
