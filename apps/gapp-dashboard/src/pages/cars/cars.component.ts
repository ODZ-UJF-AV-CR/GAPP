import { Car, CarsService } from '../../services/cars.service';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalComponent } from '@/components/modal/modal.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { ToastService } from '@/services/toast.service';
import { ApiResponse } from '@/services/api.service.base';
import { PageBlockComponent } from '@/components/page-block/page-block.component';
import { ScrollableComponent } from '@/components/scrollable/scrollable.component';

@Component({
    selector: 'gapp-cars',
    templateUrl: './cars.component.html',
    imports: [ModalComponent, ReactiveFormsModule, PageBlockComponent, ScrollableComponent],
})
export class CarsComponent implements OnInit {
    private carsService = inject(CarsService);
    private formBuilder = inject(FormBuilder);
    private toastService = inject(ToastService);
    private destroyRef = inject(DestroyRef);

    public carsSignal = signal<ApiResponse<Car[]>>({ loading: true });
    public readonly isCarModalOpened = signal(false);
    public readonly errorMessage = signal<string | undefined>(undefined);

    public readonly carForm = this.formBuilder.group({
        callsign: ['', Validators.required],
        description: [null],
    });

    public ngOnInit() {
        this.loadCars();
    }

    private loadCars() {
        this.carsService
            .getCars$()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                this.carsSignal.set(response);
            });
    }

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
                this.loadCars();
                this.carForm.reset();
            });
    }

    public deleteCar(id: string) {
        this.carsService
            .deleteCar$(id)
            .pipe(
                filter((data) => !data.loading),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.loadCars();
            });
    }

    public hasError(fieldName: string) {
        const field = this.carForm.get(fieldName);
        return !field?.valid && (field?.dirty || field?.touched);
    }
}
