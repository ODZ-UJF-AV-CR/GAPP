import type { Route } from '@angular/router';
import { type HeaderData, useHeader } from '@core/components/header/header-builder';
import { type NavbarData, useNavbar } from '@core/components/navbar/navbar-builder';
import { useFullScreen } from '@core/layout/fullscreen-builder';
import { tablerLayoutDashboard, tablerList, tablerMap2, tablerSettings2 } from '@ng-icons/tabler-icons';

export interface GappRouteData {
    navbar?: NavbarData;
    header?: HeaderData;
    fullScreen?: boolean;
}

export interface GappRoute extends Route {
    data?: GappRouteData;
}

export type GappRoutes = Array<GappRoute>;

export const ROUTES: GappRoutes = [
    {
        path: 'vehicles',
        loadChildren: () => import('@features/vehicles/vehicles-routes').then((r) => r.VEHICLES_ROUTES),
        data: {
            ...useNavbar(tablerList),
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
        path: 'map',
        loadComponent: () => import('@features/map/map.component').then((c) => c.MapComponent),
        title: 'GAPP | Map',
        data: {
            ...useHeader('Live map'),
            ...useNavbar(tablerMap2),
            ...useFullScreen(),
        },
    },
    {
        path: 'settings',
        loadComponent: () => import('@features/settings/settings.component').then((c) => c.SettingsComponent),
        title: 'GAPP | Settings',
        data: {
            ...useNavbar(tablerSettings2),
        },
    },
    {
        path: '**',
        redirectTo: 'telemetry',
        pathMatch: 'full',
    },
];
