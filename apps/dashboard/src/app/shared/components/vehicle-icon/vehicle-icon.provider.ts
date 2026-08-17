import { InjectionToken, type Provider } from '@angular/core';

export interface VehicleIcons {
    defaultIcon: string;
    /** @description Keyed by vehicle type name, ids depend on seed order and are not stable */
    icons: Record<string, string>;
}

export const VEHICLE_ICONS = new InjectionToken<VehicleIcons>('vehicle-icons');

export const provideVehicleIcons = (config: VehicleIcons): Provider => ({
    provide: VEHICLE_ICONS,
    useValue: config,
});
