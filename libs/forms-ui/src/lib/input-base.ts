import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { injectNgControl } from './input-helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControlStatus, Validators } from '@angular/forms';

export type ErrorMessageDefinition = Record<string, string>;

@Component({ template: `` })
export abstract class InputBase implements OnInit {
    private destroyRef = inject(DestroyRef);
    private ngControl = injectNgControl();

    private controlStatus = signal<FormControlStatus>('PENDING');

    public errorMessages = input<ErrorMessageDefinition>({});
    public label = input<string>();
    public help = input<string>();
    public get control() {
        return this.ngControl.control;
    }
    public isRequired!: boolean;
    public showError = computed(() => {
        this.controlStatus();
        return this.control.invalid && (this.control.touched || this.control.dirty);
    });
    public errorMessage = computed(() => {
        this.controlStatus();
        const errors = this.control.errors;
        if (!errors) return '';

        if (errors['required']) return 'This field is required.';
        if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
        if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;

        const customMessages = this.errorMessages();
        for (const key in customMessages) {
            if (errors[key]) return customMessages[key];
        }

        return 'Invalid input';
    });

    protected init() {
        this.isRequired = this.ngControl.control.hasValidator(Validators.required);
        this.control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((status) => this.controlStatus.set(status));
    }

    public ngOnInit() {
        this.init();
    }
}
