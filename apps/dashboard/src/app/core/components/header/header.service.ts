import { computed, Injectable, inject, signal, type TemplateRef } from '@angular/core';
import { ROUTE_DATA } from '@core/layout/route-data.provider';

export type HeaderContent = TemplateRef<unknown>;
export type HeaderContentPosition = 'left' | 'right';

@Injectable({ providedIn: 'root' })
export class HeaderService {
    private routeData = inject(ROUTE_DATA);

    private _contentLeft = signal<HeaderContent | undefined>(undefined);
    private _contentRight = signal<HeaderContent | undefined>(undefined);

    public readonly title = computed(() => this.routeData().header?.title);
    public readonly back = computed(() => this.routeData().header?.back);
    public readonly showHeader = computed(() => this.routeData().header?.showHeader ?? false);
    public readonly contentLeft = this._contentLeft.asReadonly();
    public readonly contentRight = this._contentRight.asReadonly();

    public setContent(position: HeaderContentPosition, template: HeaderContent) {
        if (position === 'left') {
            this._contentLeft.set(template);
        } else {
            this._contentRight.set(template);
        }
    }

    public clearContent(position: HeaderContentPosition, template: HeaderContent) {
        if (position === 'left') {
            if (this._contentLeft() === template) {
                this._contentLeft.set(undefined);
            }
        } else {
            if (this._contentRight() === template) {
                this._contentRight.set(undefined);
            }
        }
    }
}
