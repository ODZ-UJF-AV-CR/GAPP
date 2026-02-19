import { Directive, inject, type OnDestroy, type OnInit, TemplateRef } from '@angular/core';
import { HeaderService } from './header.service';

@Directive({ selector: '[headerContent]' })
export class HeaderContentDirective implements OnInit, OnDestroy {
    private readonly templateRef = inject(TemplateRef);
    private readonly headerService = inject(HeaderService);

    ngOnInit(): void {
        this.headerService.setContent(this.templateRef);
    }

    ngOnDestroy(): void {
        this.headerService.clearContent(this.templateRef);
    }
}
