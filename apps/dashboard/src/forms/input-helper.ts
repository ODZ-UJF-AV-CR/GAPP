import { Directive, inject } from '@angular/core';
import { type ControlValueAccessor, FormControlDirective, FormControlName, NG_VALUE_ACCESSOR, NgControl, NgModel } from '@angular/forms';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registerOnChange(_: unknown) {
        void 0;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registerOnTouched(_: unknown) {
        void 0;
    }
}

export const injectNgControl = () => {
    const ngControl = inject(NgControl, { self: true, optional: true });

    if (!ngControl) throw new Error('Form control not found.');

    if (ngControl instanceof FormControlDirective || ngControl instanceof FormControlName || ngControl instanceof NgModel) {
        return ngControl;
    }

    throw new Error('Form control not found.');
};
