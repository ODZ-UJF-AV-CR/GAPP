import { DOCUMENT, effect, Injectable, inject, type Renderer2, RendererFactory2, signal, untracked } from '@angular/core';
import { readStoredValue, writeStoredValue } from './storage';

export type Theme = 'light' | 'dark'; // Theme value used in DaisyUI
export type ThemeSetting = Theme | 'system'; // Theme value saved in local storage

const LOCAL_STORAGE_KEY = 'gapp-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private rendererFactory = inject(RendererFactory2);
    private document = inject(DOCUMENT);
    private renderer: Renderer2;

    private _effectiveTheme = signal<Theme>(this.getSystemPreference());
    public readonly effectiveTheme = this._effectiveTheme.asReadonly();

    private readonly _theme = signal<ThemeSetting>(this.getInitialTheme());
    public readonly theme = this._theme.asReadonly();

    private readonly _systemThemeValue = signal<Theme>(this.getSystemPreference());
    public readonly systemThemeValue = this._systemThemeValue.asReadonly();

    public setTheme(theme: ThemeSetting) {
        if (theme === 'system') {
            this._systemThemeValue.set(this.getSystemPreference());
        }

        this._theme.set(theme);
        writeStoredValue(LOCAL_STORAGE_KEY, theme);
    }

    private getInitialTheme(): ThemeSetting {
        return readStoredValue<ThemeSetting>(LOCAL_STORAGE_KEY) || 'system';
    }

    private getSystemPreference(): Theme {
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)')?.matches) {
            return 'dark';
        }

        return 'light';
    }

    constructor() {
        this.renderer = this.rendererFactory.createRenderer(null, null);
        effect(() => {
            const theme = this.theme();
            const systemTheme = this.systemThemeValue();
            const effectiveTheme = theme === 'system' ? systemTheme : theme;
            this.renderer.setAttribute(this.document.documentElement, 'data-theme', effectiveTheme);
            untracked(() => this._effectiveTheme.set(effectiveTheme));
        });
    }
}
