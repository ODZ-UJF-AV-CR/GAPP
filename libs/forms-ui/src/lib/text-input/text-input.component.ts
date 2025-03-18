import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormControlStatus, ReactiveFormsModule } from '@angular/forms';
import { NoopValueAccessorDirective } from '../helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'text-input',
    templateUrl: './text-input.component.html',
    imports: [ReactiveFormsModule],
    hostDirectives: [NoopValueAccessorDirective],
})
export class TextInputComponent implements OnInit {
    private destroyRef = inject(DestroyRef);

    public formControl = input.required<FormControl>();
    public placeholder = input<string>('');
    public label = input<string>();
    public help = input<string>();

    private controlStatus = signal<FormControlStatus>('PENDING');

    // public isRequired = computed(() => this.formControl().hasValidator(Validators.required));
    public showError = computed(() => {
        this.controlStatus();
        const control = this.formControl();
        return control.invalid && (control.touched || control.dirty);
    });

    public errorMessage = computed(() => {
        this.controlStatus();
        const errors = this.formControl().errors;
        if (!errors) return '';

        if (errors['required']) return 'This field is required.';
        if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
        if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;

        return 'Invalid input';
    });

    ngOnInit(): void {
        this.formControl()
            .statusChanges.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((status) => {
                this.controlStatus.set(status);
            });
    }
}
