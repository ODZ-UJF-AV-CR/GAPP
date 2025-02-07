import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[gappLayout]',
})
export class GappLayoutDirective implements AfterViewInit {
    private el = inject(ElementRef);

    public ngAfterViewInit() {
        this.el.nativeElement.classList.add('grid', 'place-content-top', 'sm:place-content-center', 'h-full');
    }
}
