import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'home',
        loadComponent: () => import('@/pages/homepage/homepage.component').then((c) => c.HomepageComponent),
    },
    {
        path: 'map',
        loadComponent: () => import('@/pages/map/map.component').then((c) => c.MapComponent),
        title: 'GAPP | Map',
    },
    {
        path: 'dashboard',
        loadComponent: () => import('@/pages/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        title: 'GAPP | Dashboard',
    },
    {
        path: 'vehicles',
        loadComponent: () => import('@/pages/vehicles/vehicles.component').then((c) => c.VehiclesComponent),
        title: 'GAPP | Vehicles',
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
