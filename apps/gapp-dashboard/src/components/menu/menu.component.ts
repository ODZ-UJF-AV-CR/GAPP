import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { tablerHome, tablerSettings } from '@ng-icons/tabler-icons';

@Component({
    selector: 'gapp-menu',
    templateUrl: './menu.component.html',
    imports: [RouterLink, NgIcon, RouterLinkActive],
    providers: [provideIcons({ tablerHome, tablerSettings }), provideNgIconsConfig({ size: '1.5rem' })],
})
export class MenuComponent {}
