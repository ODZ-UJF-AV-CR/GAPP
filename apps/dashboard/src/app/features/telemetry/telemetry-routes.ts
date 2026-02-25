import type { GappRoutes } from '@app/app.routes';
import { useHeader } from '@core/components/header/header-builder';

export const TELEMETRY_ROUTES: GappRoutes = [
    {
        path: '',
        loadComponent: () => import('./dashboard/telemetry-dashboard.component').then((c) => c.TelemetryDashboardComponent),
        title: 'GAPP | Telemetry',
        data: {
            ...useHeader('Telemetry'),
        },
    },
    {
        path: ':vehicleId',
        loadComponent: () => import('./detail/telemetry-detail.component').then((c) => c.TelemetryDetailComponent),
        title: 'GAPP | Vehicle detail',
        data: {
            ...useHeader('Vehicle detail'),
        },
    },
];
