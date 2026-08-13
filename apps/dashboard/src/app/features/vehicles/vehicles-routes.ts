import type { GappRoutes } from '@app/app.routes';
import { useHeader } from '@core/components/header/header-builder';

export const VEHICLES_ROUTES: GappRoutes = [
    {
        path: '',
        loadComponent: () => import('./list/vehicles-list.component').then((c) => c.VehiclesListComponent),
        title: 'GAPP | Vehicles',
        data: {
            ...useHeader('Vehicles'),
        },
    },
    {
        path: ':vehicleId',
        loadComponent: () => import('./detail/vehicle-detail.component').then((c) => c.VehicleDetailComponent),
        title: 'GAPP | Vehicle detail',
        data: {
            ...useHeader('Vehicle detail', { back: '/vehicles' }),
        },
    },
];
