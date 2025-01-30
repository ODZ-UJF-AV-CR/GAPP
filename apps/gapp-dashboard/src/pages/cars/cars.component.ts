import { GappLayoutDirective } from '@/directives/gapp-layout.directive';
import { Car, CarsService } from '@/services/cars.service';
import { Component, DestroyRef, inject, Injector, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ModalComponent } from '@/components/modal/modal.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { ToastService } from '@/services/toast.service';
import { HeaderComponent } from '@/components/header/header.component';

@Component({
    selector: 'gapp-cars',
    templateUrl: './cars.component.html',
    imports: [GappLayoutDirective, ModalComponent, ReactiveFormsModule, HeaderComponent],
})
export class CarsComponent {
    private carsService = inject(CarsService);
    private formBuilder = inject(FormBuilder);
    private toastService = inject(ToastService);
    private destroyRef = inject(DestroyRef);
    private injector = inject(Injector);

    public carsSignal = toSignal(this.carsService.getCars$());
    public readonly isCarModalOpened = signal(false);
    public readonly errorMessage = signal<string | undefined>(undefined);

    public readonly carForm = this.formBuilder.group({
        callsign: ['', Validators.required],
        description: [null],
    });

    public openCarModal() {
        this.errorMessage.set(undefined);
        this.isCarModalOpened.set(true);
    }

    public createCar() {
        if (!this.carForm.valid) {
            this.carForm.markAllAsTouched();
            return;
        }

        this.carsService
            .createCar$(this.carForm.value as Car)
            .pipe(
                filter((data) => !data.loading),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((result) => {
                if (result.error) {
                    this.errorMessage.set(result.error.message);
                    return;
                }

                this.isCarModalOpened.set(false);
                this.toastService.toast('alert-success', 'Chase car added');
                this.carsSignal = toSignal(this.carsService.getCars$(), {
                    injector: this.injector,
                });
                this.carForm.reset();
            });
    }

    public hasError(fieldName: string) {
        const field = this.carForm.get(fieldName);
        return !field?.valid && (field?.dirty || field?.touched);
    }
}
