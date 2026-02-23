import { provideHttpClient, withFetch } from '@angular/common/http';
import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { tablerAirBalloon, tablerCar, tablerDrone, tablerHelpHexagon } from '@ng-icons/tabler-icons';
import { provideVehicleIcons } from '@shared/components/vehicle-icon/vehicle-icon.provider';
import { ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(ROUTES),
        provideHttpClient(withFetch()),
        provideVehicleIcons({
            defaultIcon: tablerHelpHexagon,
            icons: new Map([
                [1, tablerAirBalloon],
                [2, tablerDrone],
                [3, tablerCar],
            ]),
        }),
    ],
};
