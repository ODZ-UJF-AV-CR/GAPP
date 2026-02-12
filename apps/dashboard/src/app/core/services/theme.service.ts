import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const LOCAL_STORAGE_KEY = 'gapp-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private _theme = signal<Theme>(this.getInitialTheme());
    public readonly theme = this._theme.asReadonly();

    constructor() {
        effect(() => {
            const theme = this._theme();
            localStorage.setItem(LOCAL_STORAGE_KEY, theme);
        });
    }

    public setTheme(theme: Theme) {
        this._theme.set(theme);
        localStorage.setItem(LOCAL_STORAGE_KEY, theme);
    }

    private getInitialTheme(): Theme {
        const existingTheme = localStorage.getItem('gapp-theme');

        if (existingTheme) {
            return existingTheme as Theme;
        }

        if (window?.matchMedia?.('(prefer-color-scheme: dark)')?.matches) {
            return 'dark';
        }

        return 'light';
    }
}
