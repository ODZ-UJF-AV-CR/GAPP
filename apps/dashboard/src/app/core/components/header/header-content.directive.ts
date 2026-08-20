import { Directive, inject, input, type OnDestroy, type OnInit, TemplateRef } from '@angular/core';
import { type HeaderContentPosition, HeaderService } from './header.service';

@Directive({ selector: '[headerContent]' })
export class HeaderContentDirective implements OnInit, OnDestroy {
    private readonly templateRef = inject(TemplateRef);
    private readonly headerService = inject(HeaderService);

    public readonly position = input<HeaderContentPosition, HeaderContentPosition | '' | string>('right', {
        alias: 'headerContent',
        transform: (value) => (value === 'left' ? 'left' : 'right'),
    });

    ngOnInit() {
        this.headerService.setContent(this.position(), this.templateRef);
    }

    ngOnDestroy() {
        this.headerService.clearContent(this.position(), this.templateRef);
    }
}
