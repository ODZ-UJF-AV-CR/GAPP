import { InjectionToken, inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import type { GappRouteData } from '@app/app.routes';
import { filter, map, startWith } from 'rxjs';

export const ROUTE_DATA = new InjectionToken<Signal<GappRouteData>>('route-data', {
    factory: () => {
        const router = inject(Router);

        return toSignal(
            router.events.pipe(
                filter((event) => event instanceof NavigationEnd),
                startWith(null),
                map(() => {
                    let route = router.routerState.root;
                    while (route.firstChild) {
                        route = route.firstChild;
                    }
                    return route.snapshot.data as GappRouteData;
                }),
            ),
            { requireSync: true },
        );
    },
});
