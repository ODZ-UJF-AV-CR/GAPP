import { provideHttpClient } from '@angular/common/http';
import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideUnits, type UnitConfig } from '@core/services/unit.provider';
import { provideMaplibreWorker } from '@maplibre/ngx-maplibre-gl/config';
import { tablerAirBalloon, tablerCar, tablerDrone, tablerHelpHexagon } from '@ng-icons/tabler-icons';
import { provideVehicleIcons, type VehicleIcons } from '@shared/components/vehicle-icon/vehicle-icon.provider';
import { ROUTES } from './app.routes';

const UNIT_CONFIG: UnitConfig = {
    metric: {
        distance: { unit: 'm', factor: 1 },
    },
    imperial: {
        distance: { unit: 'ft', factor: 3.2808399 },
    },
};

const VEHICLE_ICONS: VehicleIcons = {
    defaultIcon: tablerHelpHexagon,
    icons: new Map([
        [1, tablerAirBalloon],
        [2, tablerDrone],
        [3, tablerCar],
    ]),
};

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(ROUTES),
        provideHttpClient(),
        provideUnits(UNIT_CONFIG),
        provideVehicleIcons(VEHICLE_ICONS),
        provideMaplibreWorker('maplibre-gl-worker.mjs'),
    ],
};
