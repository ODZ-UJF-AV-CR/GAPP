import type { Route } from '@angular/router';
import { type HeaderData, useHeader } from '@core/components/header/header-builder';
import { type NavbarData, useNavbar } from '@core/components/navbar/navbar-builder';
import { tablerBuildingBroadcastTower, tablerListDetails, tablerMapPins } from '@ng-icons/tabler-icons';

export interface GappData {
    navbar?: NavbarData;
    header?: HeaderData;
}

export interface GappRoute extends Route {
    data?: GappData;
}

export type GappRoutes = Array<GappRoute>;

export const ROUTES: GappRoutes = [
    {
        path: 'vehicles',
        loadComponent: () => import('@features/vehicles/vehicles.component').then((c) => c.VehiclesComponent),
        title: 'GAPP | Vehicles',
        data: {
            ...useNavbar(tablerListDetails),
            ...useHeader('Vehicles'),
        },
    },
    {
        path: 'telemetry',
        loadChildren: () => import('@features/telemetry/telemetry-routes').then((r) => r.TELEMETRY_ROUTES),
        data: {
            ...useNavbar(tablerBuildingBroadcastTower),
        },
    },
    {
        path: 'sondehub',
        loadComponent: () => import('@features/sondehub/sondehub.component').then((c) => c.SondehubComponent),
        title: 'GAPP | Sondehub',
        data: {
            ...useNavbar(tablerMapPins),
        },
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
