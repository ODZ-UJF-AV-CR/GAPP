import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService, type ThemeSetting } from './theme.service';

@Component({
    selector: 'theme-switch',
    templateUrl: './theme-switch.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
})
export class ThemeSwitchComponent {
    private themeService = inject(ThemeService);

    public systemThemeValue = this.themeService.systemThemeValue;

    public isChecked(theme: ThemeSetting): boolean {
        return this.themeService.theme() === theme;
    }

    public selectTheme(theme: ThemeSetting) {
        this.themeService.setTheme(theme);
    }
}
