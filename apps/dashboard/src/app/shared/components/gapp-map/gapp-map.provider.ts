import { InjectionToken, type Provider, type Signal } from '@angular/core';
import type { MapImageOptions } from '@maplibre/ngx-maplibre-gl';

export const GAPP_MAP_TILES = new InjectionToken<Signal<string>>('gapp-map-tiles');

export interface GappMapIcon {
    id: string;
    url: string;
    options?: MapImageOptions;
}

export const GAPP_MAP_ICONS = new InjectionToken<GappMapIcon[]>('gapp-map-icons');

export const provideGappMapIcons = (icons: GappMapIcon[]): Provider => ({
    provide: GAPP_MAP_ICONS,
    useValue: icons,
});

export interface GappMapVehicleIcons {
    defaultIcon: string;
    /** @description Keyed by vehicle type name, ids depend on seed order and are not stable */
    icons: Record<string, string>;
}

export const GAPP_MAP_VEHICLE_ICONS = new InjectionToken<GappMapVehicleIcons>('gapp-map-vehicle-icons');

export const provideGappMapVehicleIcons = (config: GappMapVehicleIcons): Provider => ({
    provide: GAPP_MAP_VEHICLE_ICONS,
    useValue: config,
});
