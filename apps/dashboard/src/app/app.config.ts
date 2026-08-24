import { provideHttpClient } from '@angular/common/http';
import { type ApplicationConfig, computed, type Provider, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { provideTicker } from '@core/services/ticker.provider';
import { provideUnits, type UnitConfig } from '@core/services/unit.provider';
import { provideMaplibreWorker } from '@maplibre/ngx-maplibre-gl/config';
import { tablerAirBalloon, tablerCar, tablerDrone, tablerHelpHexagon } from '@ng-icons/tabler-icons';
import {
    GAPP_MAP_TILES,
    type GappMapIcon,
    type GappMapVehicleIcons,
    provideGappMapIcons,
    provideGappMapVehicleIcons,
} from '@shared/components/gapp-map/gapp-map.provider';
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
    icons: {
        balloon: tablerAirBalloon,
        drone: tablerDrone,
        car: tablerCar,
    },
};

const LIGHT_MAP_TILES = 'https://api.maptiler.com/maps/streets-v4/style.json?key=MntG79mODrh17H1Fjf1s';
const DARK_MAP_TILES = 'https://api.maptiler.com/maps/landscape-v4-dark/style.json?key=MntG79mODrh17H1Fjf1s';

const MAP_ICONS: GappMapIcon[] = [
    {
        id: 'chase-car',
        url: 'map-icons/chase-car.png',
        options: {
            pixelRatio: 2.6,
            sdf: false,
        },
    },
    {
        id: 'baloon',
        url: 'map-icons/baloon.webp',
        options: {
            pixelRatio: 2,
            sdf: false,
        },
    },
];

const MAP_VEHICLE_ICONS: GappMapVehicleIcons = {
    defaultIcon: 'baloon',
    icons: {
        car: 'chase-car',
        balloon: 'baloon',
        drone: 'baloon',
    },
};

const provideMapTiles = (): Provider => ({
    provide: GAPP_MAP_TILES,
    useFactory: (themeService: ThemeService) => computed(() => (themeService.effectiveTheme() === 'light' ? LIGHT_MAP_TILES : DARK_MAP_TILES)),
    deps: [ThemeService],
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(ROUTES),
        provideHttpClient(),
        provideUnits(UNIT_CONFIG),
        provideVehicleIcons(VEHICLE_ICONS),
        provideTicker(),
        provideMapTiles(),
        provideGappMapIcons(MAP_ICONS),
        provideGappMapVehicleIcons(MAP_VEHICLE_ICONS),
        provideMaplibreWorker('maplibre-gl-worker.mjs'),
    ],
};
