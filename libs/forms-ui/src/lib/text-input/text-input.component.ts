import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'text-input',
    templateUrl: './text-input.component.html',
    imports: [NgClass, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: TextInputComponent,
            multi: true
        }
    ]
})
export class TextInputComponent implements ControlValueAccessor {
      private onChange?: (value: string) => void;
      private onTouched?: () => void;
      private touched = false;
      private disabled = false;

    public label = input<string>();
    public help = input<string>();
    public placeholder = input<string | null>(null);
    public type = input<'text' | 'password'>('text');
    public size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

    public sizeClass = computed(() => `input-${this.size()}`);

    public control = new FormControl('');

      public writeValue(value: string) {
          this.control.setValue(value);
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
}
