import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@app/core/toasts';
import { type DialogButton, DialogComponent } from '@app/shared/dialog';
import { type OptionDefinition, SelectInputComponent, TextInputComponent } from '@shared/forms';
import { VehicleService } from '@shared/services';
import { filter } from 'rxjs';

@Component({
    selector: 'create-vehicle',
    templateUrl: './create-vehicle.component.html',
    imports: [ReactiveFormsModule, TextInputComponent, SelectInputComponent, DialogComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class CreateVehicleComponent {
    private vehiclesService = inject(VehicleService);
    private formBuilder = inject(FormBuilder);
    private toastService = inject(ToastService);
    private router = inject(Router);

    public dialogRef = viewChild.required<DialogComponent>('dialog');
    public vehicleTypes = computed<OptionDefinition[]>(() =>
        this.vehiclesService.vehicleTypesList().map((type) => ({ label: type.type_name, value: type.id })),
    );
    public form = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(32)]],
        vehicle_type_id: ['', Validators.required],
    });
    public dialogButtons: DialogButton[] = [{ label: 'Create', style: 'btn-primary', action: () => this.createVehicle() }];

    public createVehicle() {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        const { name, vehicle_type_id } = this.form.getRawValue();

        this.vehiclesService
            .createVehicle$({ name, vehicle_type_id: Number(vehicle_type_id) })
            .pipe(filter((response) => !!response.data))
            .subscribe(({ data }) => {
                this.toastService.toast('alert-success', 'Vehicle created successfully.');
                this.form.reset();
                this.form.markAsUntouched();
                this.dialogRef().close();
                this.router.navigate(['/vehicles', data?.id]);
            });
    }

    public open() {
        this.form.reset();
        this.dialogRef().open();
    }
}
