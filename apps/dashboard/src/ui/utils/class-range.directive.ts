import { Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';

export type ClassRangeOptions = {
    [key: number]: string;
};

@Directive({
    selector: '[classRange]',
})
export class ClassRangeDirective {
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);

    public config = input<ClassRangeOptions>({}, { alias: 'classRange' });
    public value = input<number | undefined | null>();

    constructor() {
        effect(() => {
            Object.values(this.config()).forEach((className) => {
                this.renderer.removeClass(this.el.nativeElement, className);
            });

            this.renderer.addClass(this.el.nativeElement, this.getClassForValue(this.value()));
        });
    }

    private getClassForValue(value?: number | null): string {
        const config = this.config();
        const thresholds = Object.keys(config)
            .map(Number)
            .sort((a, b) => a - b);

        for (const threshold of thresholds) {
            if (!value) {
                return config[threshold];
            }

            if (value <= threshold) {
                return config[threshold];
            }
        }

        return config[thresholds[thresholds.length - 1]];
    }
}
