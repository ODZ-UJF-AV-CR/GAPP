import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputBase } from '../input-base';
import { NoopValueAccessorDirective } from '../input-helper';

@Component({
    selector: 'toggle-input',
    templateUrl: './toggle-input.component.html',
    imports: [ReactiveFormsModule, NgClass],
    hostDirectives: [NoopValueAccessorDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleInputComponent extends InputBase {
    public sizeClass = computed(() => `toggle-${this.size()}`);
}
