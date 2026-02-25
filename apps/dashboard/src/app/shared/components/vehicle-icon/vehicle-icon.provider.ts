import { InjectionToken, type Provider } from '@angular/core';

export interface VehicleIcons {
    defaultIcon: string;
    icons: Map<number, string>;
}

export const VEHICLE_ICONS = new InjectionToken<VehicleIcons>('vehicle-icons');

export const provideVehicleIcons = (config: VehicleIcons): Provider => ({
    provide: VEHICLE_ICONS,
    useValue: config,
});
