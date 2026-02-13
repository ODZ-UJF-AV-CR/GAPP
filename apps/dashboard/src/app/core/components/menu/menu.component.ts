import { Component } from '@angular/core';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { tablerSettings } from '@ng-icons/tabler-icons';
import { ThemeSwitchComponent } from '../../theme-switch/theme-switch.component';

@Component({
    selector: 'gapp-menu',
    templateUrl: './menu.component.html',
    imports: [NgIcon, ThemeSwitchComponent],
    providers: [provideIcons({ tablerSettings }), provideNgIconsConfig({ size: '1.5rem', strokeWidth: 1.5 })],
})
export class MenuComponent {}
