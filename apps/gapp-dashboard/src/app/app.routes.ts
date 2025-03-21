import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'home',
        loadComponent: () => import('@/pages/homepage/homepage.component').then((c) => c.HomepageComponent),
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
        path: 'sondehub',
        loadComponent: () => import('@/pages/sondehub/sondehub.component').then((c) => c.SondehubComponent),
        title: 'GAPP | Sondehub',
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
