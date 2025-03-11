import { Car, CarsService } from '@/services/cars.service';
import { Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogButton, DialogComponent, DialogDirective } from '@gapp/ui/dialog';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { ToastService } from '@/services/toast.service';
import { ApiResponse } from '@/services/api.service.base';
import { PageBlockComponent } from '@/components/page-block/page-block.component';
import { ScrollableComponent } from '@gapp/ui/scrollable';
import { LoaderComponent } from '@gapp/ui/loader';
import { ErrorClassDirective } from '@gapp/forms-ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerTrash } from '@ng-icons/tabler-icons';
import { TextLimitDirective } from '@gapp/ui/utils';

@Component({
    selector: 'gapp-cars',
    templateUrl: './cars.component.html',
    imports: [
        DialogComponent,
        ReactiveFormsModule,
        PageBlockComponent,
        ScrollableComponent,
        LoaderComponent,
        ErrorClassDirective,
        NgIcon,
        DialogDirective,
        TextLimitDirective,
    ],
    providers: [provideIcons({ tablerTrash })],
})
export class CarsComponent implements OnInit {
    private carsService = inject(CarsService);
    private formBuilder = inject(FormBuilder);
    private toastService = inject(ToastService);
    private destroyRef = inject(DestroyRef);

    private addCarDialog = viewChild.required<DialogComponent>('addCarDialog');

    public readonly carsSignal = signal<ApiResponse<Car[]>>({ loading: true });
    public readonly errorMessage = signal<string | undefined>(undefined);

    public readonly carForm = this.formBuilder.group({
        callsign: ['', Validators.required],
        description: [null],
    });

    public readonly carInput = this.carForm.get('callsign') as AbstractControl;
    public readonly descriptionInput = this.carForm.get('description') as AbstractControl;

    public get modalButton(): DialogButton {
        return {
            label: 'Create',
            style: 'btn-primary',
            action: () => this.createCar(),
        };
    }

    public ngOnInit() {
        this.loadCars();
    }

    public openCarModal() {
        this.errorMessage.set(undefined);
        this.addCarDialog().open();
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

                this.addCarDialog().close();
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

    private loadCars() {
        this.carsService
            .getCars$()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                this.carsSignal.set(response);
            });
    }
}
