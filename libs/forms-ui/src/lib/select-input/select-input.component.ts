import { Component, input } from '@angular/core';
import { NoopValueAccessorDirective } from '../input-helper';
import { ReactiveFormsModule } from '@angular/forms';
import { InputBase } from '../input-base';

export interface OptionDefinition {
    value: string;
    label: string;
}

@Component({
    selector: 'select-input',
    templateUrl: './select-input.component.html',
    imports: [ReactiveFormsModule],
    hostDirectives: [NoopValueAccessorDirective],
})
export class SelectInputComponent extends InputBase {
    public options = input<OptionDefinition[]>([]);
}
