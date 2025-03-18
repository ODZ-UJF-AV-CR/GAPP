import { Directive, inject } from '@angular/core';
import { ControlValueAccessor, FormControlDirective, FormControlName, NG_VALUE_ACCESSOR, NgControl, NgModel } from '@angular/forms';

@Directive({
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: NoopValueAccessorDirective,
        },
    ],
})
export class NoopValueAccessorDirective implements ControlValueAccessor {
    writeValue() {
        void 0;
    }
    registerOnChange(_: unknown) {
        void 0;
    }
    registerOnTouched(_: unknown) {
        void 0;
    }
}

export function injectNgControl() {
    const ngControl = inject(NgControl, { self: true, optional: true });

    if (!ngControl) throw new Error('...');

    if (ngControl instanceof FormControlDirective || ngControl instanceof FormControlName || ngControl instanceof NgModel) {
        return ngControl;
    }

    throw new Error(`...`);
}
