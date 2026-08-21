import { InjectionToken, type Signal } from '@angular/core';

export const GAPP_MAP_TILES = new InjectionToken<Signal<string>>('gapp-map-tiles');

export const GAPP_MAP_ICONS = new InjectionToken<Signal<string>>('gapp-map-icons');
