import { IMAGE_CONFIG } from '@angular/common';
import type { Route, Routes } from '@angular/router';
import { tablerBuildingBroadcastTower, tablerHome, tablerListDetails, tablerMapPin, tablerMapPins } from '@ng-icons/tabler-icons';

export interface RouteData {
    icon: string;
}

export interface GappRoute extends Route {
    data?: RouteData;
}

export type GappRoutes = Array<GappRoute>;

export const ROUTES: GappRoutes = [
    {
        path: 'home',
        loadComponent: () => import('@features/home/homepage.component').then((c) => c.HomepageComponent),
        data: {
            icon: tablerHome,
        },
    },
    {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        title: 'GAPP | Dashboard',
        data: {
            icon: tablerBuildingBroadcastTower,
        },
    },
    {
        path: 'vehicles',
        loadComponent: () => import('@features/vehicles/vehicles.component').then((c) => c.VehiclesComponent),
        title: 'GAPP | Vehicles',
        data: {
            icon: tablerListDetails,
        },
    },
    {
        path: 'sondehub',
        loadComponent: () => import('@features/sondehub/sondehub.component').then((c) => c.SondehubComponent),
        title: 'GAPP | Sondehub',
        data: {
            icon: tablerMapPins,
        },
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
