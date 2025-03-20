import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NoopValueAccessorDirective } from '../input-helper';
import { ReactiveFormsModule } from '@angular/forms';
import { InputBase } from '../input-base';
import { NgClass } from '@angular/common';

export interface OptionDefinition {
    value: string;
    label: string;
}

@Component({
    selector: 'select-input',
    templateUrl: './select-input.component.html',
    imports: [ReactiveFormsModule, NgClass],
    hostDirectives: [NoopValueAccessorDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectInputComponent extends InputBase {
    public options = input<OptionDefinition[]>([]);
    public sizeClass = computed(() => `select-${this.size()}`);
}
