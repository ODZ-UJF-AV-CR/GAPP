import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { GappRoute, type GappRoutes } from '@app/app.routes';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import {
    tablerAdjustments,
    tablerBuildingBroadcastTower,
    tablerHome,
    tablerLayoutDashboard,
    tablerListDetails,
    tablerMapPins,
    tablerRouter,
    tablerWifi,
} from '@ng-icons/tabler-icons';

@Component({
    selector: 'gapp-navbar',
    templateUrl: './navbar.component.html',
    imports: [RouterLink, NgIcon, RouterLinkActive],
    providers: [
        provideIcons({
            tablerHome,
            tablerLayoutDashboard,
            tablerAdjustments,
            tablerRouter,
            tablerListDetails,
            tablerMapPins,
            tablerWifi,
            tablerBuildingBroadcastTower,
        }),
        provideNgIconsConfig({ size: '1.5rem' }),
    ],
})
export class NavbarComponent {
    private router = inject(Router);
    private routes = this.router.config as GappRoutes;

    public navbarItems = this.routes
        .filter(({ data }) => data?.showInNavbar)
        .map((route) => ({
            path: route.path,
            icon: route.data?.icon,
        }));
}
