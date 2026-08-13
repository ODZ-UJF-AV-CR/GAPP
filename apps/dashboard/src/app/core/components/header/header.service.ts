import { computed, Injectable, inject, signal, type TemplateRef } from '@angular/core';
import { ROUTE_DATA } from '@core/layout/route-data.provider';

export type HeaderContent = TemplateRef<unknown>;

@Injectable({ providedIn: 'root' })
export class HeaderService {
    private routeData = inject(ROUTE_DATA);

    private _content = signal<HeaderContent | undefined>(undefined);

    public readonly title = computed(() => this.routeData().header?.title);
    public readonly back = computed(() => this.routeData().header?.back);
    public readonly showHeader = computed(() => this.routeData().header?.showHeader ?? false);
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
