import type { Route } from '@angular/router';
import { type HeaderData, useHeader } from '@core/components/header/header-builder';
import { type NavbarData, useNavbar } from '@core/components/navbar/navbar-builder';
import { tablerLayoutDashboard, tablerList, tablerMap2, tablerSettings2 } from '@ng-icons/tabler-icons';

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
            ...useNavbar(tablerList),
            ...useHeader('Vehicles'),
        },
    },
    {
        path: 'telemetry',
        loadChildren: () => import('@features/telemetry/telemetry-routes').then((r) => r.TELEMETRY_ROUTES),
        data: {
            ...useNavbar(tablerLayoutDashboard),
        },
    },
    {
        path: 'sondehub',
        loadComponent: () => import('@features/sondehub/sondehub.component').then((c) => c.SondehubComponent),
        title: 'GAPP | Sondehub',
        data: {
            ...useNavbar(tablerMap2),
        },
    },
    {
        path: 'settings',
        loadComponent: () => import('@features/settings/settings.component').then((c) => c.SettingsComponent),
        title: 'GAPP | Settings',
        data: {
            ...useNavbar(tablerSettings2),
            ...useHeader('Settings'),
        },
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
