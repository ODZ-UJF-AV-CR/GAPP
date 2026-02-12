import type { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('@features/home/homepage.component').then((c) => c.HomepageComponent),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        title: 'GAPP | Dashboard',
    },
    {
        path: 'vehicles',
        loadComponent: () => import('@features/vehicles/vehicles.component').then((c) => c.VehiclesComponent),
        title: 'GAPP | Vehicles',
    },
    {
        path: 'sondehub',
        loadComponent: () => import('@features/sondehub/sondehub.component').then((c) => c.SondehubComponent),
        title: 'GAPP | Sondehub',
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
