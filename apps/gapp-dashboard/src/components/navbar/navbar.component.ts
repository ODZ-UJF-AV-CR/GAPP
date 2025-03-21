import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import {
    tablerHome,
    tablerLayoutDashboard,
    tablerAdjustments,
    tablerRouter,
    tablerListDetails,
    tablerMapPins,
    tablerWifi,
    tablerBuildingBroadcastTower,
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
export class NavbarComponent {}
