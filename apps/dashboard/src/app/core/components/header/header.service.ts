import { Injectable, signal, type TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HeaderService {
    public readonly content = signal<TemplateRef<unknown> | null>(null);

    public setContent(template: TemplateRef<unknown>) {
        this.content.set(template);
    }

    public clearContent(template: TemplateRef<unknown>) {
        if (this.content() === template) {
            this.content.set(null);
        }
    }
}
