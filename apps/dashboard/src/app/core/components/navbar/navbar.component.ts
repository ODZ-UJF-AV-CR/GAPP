import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import type { GappRoutes } from '@app/app.routes';
import { NgIcon, provideNgIconsConfig } from '@ng-icons/core';

@Component({
    selector: 'gapp-navbar',
    templateUrl: './navbar.component.html',
    imports: [RouterLink, NgIcon, RouterLinkActive],
    providers: [provideNgIconsConfig({ size: '1.5rem' })],
})
export class NavbarComponent {
    private router = inject(Router);
    private routes = this.router.config as GappRoutes;

    public navbarItems = this.routes
        .filter(({ data }) => data?.navbar?.showInNavbar)
        .map((route) => ({
            path: route.path,
            icon: route.data?.navbar?.icon,
        }));
}
