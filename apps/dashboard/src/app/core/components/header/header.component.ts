import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import type { HeaderContent } from './header.service';

@Component({
    selector: 'gapp-header',
    templateUrl: './header.component.html',
    imports: [NgTemplateOutlet],
})
export class HeaderComponent {
    public readonly title = input<string | undefined>(undefined);
    public readonly content = input<HeaderContent | undefined>(undefined);
}
