import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputBase } from '../input-base';
import { NoopValueAccessorDirective } from '../input-helper';

export type TextInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';

@Component({
    selector: 'text-input',
    templateUrl: './text-input.component.html',
    imports: [ReactiveFormsModule, NgClass],
    hostDirectives: [NoopValueAccessorDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInputComponent extends InputBase {
    public placeholder = input<string>('');
    public type = input<TextInputType>('text');

    public inputSizeClass = computed(() => `input-${this.size()}`);
    public textareaSizeClass = computed(() => `textarea-${this.size()}`);
}
