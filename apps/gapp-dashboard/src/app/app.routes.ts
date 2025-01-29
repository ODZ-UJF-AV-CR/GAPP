import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'home',
        loadComponent: () => import('@/pages/homepage/homepage.component').then((c) => c.HomepageComponent),
    },
    {
        path: 'setup',
        loadComponent: () => import('@/pages/setup/setup.component').then((c) => c.SetupComponent),
    },
    {
        path: 'map',
        loadComponent: () => import('@/pages/map/map.component').then((c) => c.MapComponent),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('@/pages/dashboard/dashboard.component').then((c) => c.DashboardComponent),
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
