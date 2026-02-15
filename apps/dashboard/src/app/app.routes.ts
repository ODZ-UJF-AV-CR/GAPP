import type { Route } from '@angular/router';
import { type NavbarData, useNavbar } from '@core/components/navbar/navbar-builder';
import { tablerBuildingBroadcastTower, tablerHome, tablerListDetails, tablerMapPins } from '@ng-icons/tabler-icons';

export interface GappRoute extends Route {
    data?: NavbarData;
}

export type GappRoutes = Array<GappRoute>;

export const ROUTES: GappRoutes = [
    {
        path: 'home',
        loadComponent: () => import('@features/home/homepage.component').then((c) => c.HomepageComponent),
        data: {
            ...useNavbar(tablerHome),
        },
    },
    {
        path: 'vehicles',
        loadComponent: () => import('@features/vehicles/vehicles.component').then((c) => c.VehiclesComponent),
        title: 'GAPP | Vehicles',
        data: {
            ...useNavbar(tablerListDetails),
        },
    },
    {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        title: 'GAPP | Dashboard',
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
