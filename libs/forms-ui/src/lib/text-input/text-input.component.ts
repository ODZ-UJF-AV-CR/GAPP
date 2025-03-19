import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopValueAccessorDirective } from '../input-helper';
import { InputBase } from '../input-base';

export type TextInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';

@Component({
    selector: 'text-input',
    templateUrl: './text-input.component.html',
    imports: [ReactiveFormsModule],
    hostDirectives: [NoopValueAccessorDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInputComponent extends InputBase {
    public placeholder = input<string>('');
    public type = input<TextInputType>('text');
}
