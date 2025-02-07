import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '@/components/menu/menu.component';
import { ToastsComponent } from '@/components/toasts/toasts.component';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { tablerMoonStars, tablerSun } from '@ng-icons/tabler-icons';

@Component({
    selector: 'gapp-root',
    templateUrl: './layout.component.html',
    imports: [RouterOutlet, MenuComponent, ToastsComponent, NgIcon],
    providers: [provideIcons({ tablerSun, tablerMoonStars }), provideNgIconsConfig({ size: '1.75rem', strokeWidth: '1.5' })],
})
export class LayoutComponent {}
