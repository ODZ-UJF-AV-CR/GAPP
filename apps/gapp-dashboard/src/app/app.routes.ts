import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('../pages/homepage/homepage.component').then((c) => c.HomepageComponent),
    },
    {
        path: 'setup',
        loadComponent: () => import('../pages/setup/setup.component').then((c) => c.SetupComponent),
    },
];
