import { InjectionToken, type Provider } from '@angular/core';

export interface UnitDefinition {
    unit: string;
    factor: number;
    offset?: number;
}

export type UnitSystem = 'metric' | 'imperial';
export type UnitCategory = 'distance';

export type UnitConfig = Record<UnitSystem, Record<UnitCategory, UnitDefinition>>;

export const UNIT_CONFIG = new InjectionToken<UnitConfig>('unit-config');

export const provideUnits = (config: UnitConfig): Provider => ({
    provide: UNIT_CONFIG,
    useValue: config,
});
