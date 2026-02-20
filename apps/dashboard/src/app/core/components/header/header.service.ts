import { computed, Injectable, inject, signal, type TemplateRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import type { GappData } from '@app/app.routes';
import { filter, map, startWith } from 'rxjs';

export type HeaderContent = TemplateRef<unknown>;

@Injectable({ providedIn: 'root' })
export class HeaderService {
    private router = inject(Router);

    private _content = signal<HeaderContent | undefined>(undefined);
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

    public readonly title = computed(() => this.routeData()?.header?.title);
    public readonly showHeader = computed(() => this.routeData()?.header?.showHeader ?? false);
    public readonly content = this._content.asReadonly();

    public setContent(template: HeaderContent) {
        this._content.set(template);
    }

    public clearContent(template: HeaderContent) {
        if (this.content() === template) {
            this._content.set(undefined);
        }
    }
}
