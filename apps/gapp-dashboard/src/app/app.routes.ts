import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'home',
        loadComponent: () => import('@/pages/homepage/homepage.component').then((c) => c.HomepageComponent),
    },
    {
        path: 'cars',
        loadComponent: () => import('@/pages/cars/cars.component').then((c) => c.CarsComponent),
    },
    {
        path: 'vessels',
        loadComponent: () => import('@/pages/vessels/vessels.component').then((c) => c.VesselsComponent),
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
