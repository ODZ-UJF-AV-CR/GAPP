import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class themeService {
    public readonly theme = signal<Theme>(this.getInitialTheme());

    constructor() {
        effect(() => {
            const theme = this.theme();
            localStorage.setItem('gapp-theme', theme);
        });
    }

    private getInitialTheme(): Theme {
        const existingTheme = localStorage.getItem('gapp-theme');

        if (existingTheme) {
            return existingTheme as Theme;
        }

        if (window?.matchMedia('(prefer-color-scheme: dark)')?.matches) {
            return 'dark';
        }

        return 'light';
    }
}
