import { Component, inject } from '@angular/core';
import { type Theme, ThemeService } from '@core/services/theme.service';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { tablerSettings } from '@ng-icons/tabler-icons';

@Component({
    selector: 'gapp-menu',
    templateUrl: './menu.component.html',
    imports: [NgIcon],
    providers: [provideIcons({ tablerSettings }), provideNgIconsConfig({ size: '1.5rem', strokeWidth: 1.5 })],
})
export class MenuComponent {
    private themeService = inject(ThemeService);

    public isChecked(theme: Theme): boolean {
        return this.themeService.theme() === theme;
    }

    public selectTheme(theme: Theme) {
        this.themeService.setTheme(theme);
    }
}
