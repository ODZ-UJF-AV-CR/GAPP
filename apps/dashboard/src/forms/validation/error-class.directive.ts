import { DestroyRef, Directive, ElementRef, inject, input, OnInit, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';

@Directive({
    selector: '[errorClass]',
})
export class ErrorClassDirective implements OnInit {
    private elementRef = inject(ElementRef);
    private renderer = inject(Renderer2);
    private destroyRef = inject(DestroyRef);

    public errorClass = input.required<string | string[]>();
    public control = input.required<AbstractControl>();

    public ngOnInit() {
        this.control()
            .events.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                const control = this.control();

                if (this.hasError(control)) {
                    this.addClass(this.errorClass());
                } else {
                    this.removeClass(this.errorClass());
                }
            });
    }

    private hasError(control: AbstractControl) {
        return control.invalid && (control.touched || control.dirty);
    }

    private addClass(cssClass: string | string[]) {
        if (Array.isArray(cssClass)) {
            cssClass.forEach((cssClass) => this.renderer.addClass(this.elementRef.nativeElement, cssClass));
        } else {
            this.renderer.addClass(this.elementRef.nativeElement, cssClass);
        }
    }

    private removeClass(cssClass: string | string[]) {
        if (Array.isArray(cssClass)) {
            cssClass.forEach((cssClass) => this.renderer.removeClass(this.elementRef.nativeElement, cssClass));
        } else {
            this.renderer.removeClass(this.elementRef.nativeElement, cssClass);
        }
    }
}
