import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import type { GappData } from '@app/app.routes';
import { filter, map, startWith } from 'rxjs';

@Component({
    selector: 'gapp-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent {
    private router = inject(Router);

    private routeData = toSignal(
        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            startWith(null),
            map(() => {
                let route = this.router.routerState.root;
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route.snapshot.data as GappData;
            }),
        ),
    );

    public title = computed(() => this.routeData()?.header?.title);
    public showHeader = computed(() => this.routeData()?.header?.showHeader ?? false);
}
