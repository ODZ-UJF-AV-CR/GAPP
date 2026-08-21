import { provideHttpClient } from '@angular/common/http';
import { type ApplicationConfig, computed, type Provider, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { provideTicker } from '@core/services/ticker.provider';
import { provideUnits, type UnitConfig } from '@core/services/unit.provider';
import { provideMaplibreWorker } from '@maplibre/ngx-maplibre-gl/config';
import { tablerAirBalloon, tablerCar, tablerDrone, tablerHelpHexagon } from '@ng-icons/tabler-icons';
import { GAPP_MAP_TILES, type GappMapIcon, provideGappMapIcons } from '@shared/components/gapp-map/gapp-map.provider';
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

const LIGHT_MAP_TILES = 'https://tiles.openfreemap.org/styles/liberty';
const DARK_MAP_TILES = 'https://tiles.openfreemap.org/styles/dark';

const MAP_ICONS: GappMapIcon[] = [
    {
        id: 'chase-car',
        url: 'map-icons/car-icon.jpg',
    },
];

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
        provideMaplibreWorker('maplibre-gl-worker.mjs'),
    ],
};
