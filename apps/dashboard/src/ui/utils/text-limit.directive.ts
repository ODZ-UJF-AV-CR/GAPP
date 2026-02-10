import { Directive, ElementRef, inject, input, numberAttribute, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[textLimit]',
})
export class TextLimitDirective implements OnInit {
    private renderer = inject(Renderer2);
    private element = inject(ElementRef);

    public textLimit = input.required({ transform: (value) => numberAttribute(value, 1) });

    public ngOnInit() {
        this.set('display', '-webkit-box');
        this.set('display', '-webkit-box');
        this.set('-webkit-line-clamp', this.textLimit());
        this.set('-webkit-box-orient', 'vertical');
        this.set('overflow', 'hidden');
        this.set('word-break', 'break-all');
    }

    private set(style: string, value: string | number) {
        this.renderer.setStyle(this.element.nativeElement, style, value);
    }
}
