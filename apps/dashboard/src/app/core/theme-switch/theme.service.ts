import { computed, DOCUMENT, effect, Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark'; // Theme value used in DaisyUI
export type ThemeSetting = Theme | 'system'; // Theme value saved in local storage

const LOCAL_STORAGE_KEY = 'gapp-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly _theme = signal<ThemeSetting>(this.getInitialTheme());
    public readonly theme = this._theme.asReadonly();

    private readonly _systemThemeValue = signal<Theme>(this.getSystemPreference());
    public readonly systemThemeValue = this._systemThemeValue.asReadonly();

    public setTheme(theme: ThemeSetting) {
        if (theme === 'system') {
            this._systemThemeValue.set(this.getSystemPreference());
        }

        this._theme.set(theme);
        localStorage.setItem(LOCAL_STORAGE_KEY, theme);
    }

    private getInitialTheme(): ThemeSetting {
        return (localStorage.getItem(LOCAL_STORAGE_KEY) as ThemeSetting | null) || 'system';
    }

    private getSystemPreference(): Theme {
        if (window?.matchMedia('(prefers-color-scheme: dark)')?.matches) {
            return 'dark';
        }

        return 'light';
    }
}
