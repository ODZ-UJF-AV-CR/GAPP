import { booleanAttribute, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'text-input',
    templateUrl: './text-input.component.html',
    imports: [NgClass, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: TextInputComponent,
            multi: true,
        },
    ],
})
export class TextInputComponent implements ControlValueAccessor {
    private onChange?: (value: string) => void;
    public onTouched?: () => void;
    private touched = false;
    public disabled = false;

    public label = input<string>();
    public help = input<string>();
    public placeholder = input<string | null>(null);
    public required = input(false, { transform: booleanAttribute });
    public type = input<'text' | 'password'>('text');
    public size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

    public value = '';
    public sizeClass = computed(() => `input-${this.size()}`);

    public writeValue(value: string) {
        this.value = value;
    }

    public registerOnChange(onChange: (value: string) => void) {
        this.onChange = onChange;
    }

    public registerOnTouched(onTouched: () => void) {
        this.onTouched = onTouched;
    }

    public markAsTouched() {
        if (!this.touched) {
            this.onTouched?.();
            this.touched = true;
        }
    }

    public setDisabledState(disabled: boolean) {
        this.disabled = disabled;
    }

    public onInput(event: Event) {
        this.value = (event.target as HTMLInputElement).value;
        this.onChange?.(this.value);
    }
}
