import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowLeft } from '@ng-icons/tabler-icons';
import type { HeaderContent } from './header.service';

@Component({
    selector: 'gapp-header',
    templateUrl: './header.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgTemplateOutlet, RouterLink, NgIcon],
    providers: [provideIcons({ tablerArrowLeft })],
})
export class HeaderComponent {
    public readonly title = input<string | undefined>(undefined);
    public readonly content = input<HeaderContent | undefined>(undefined);
    public readonly back = input<string | undefined>(undefined);
}
