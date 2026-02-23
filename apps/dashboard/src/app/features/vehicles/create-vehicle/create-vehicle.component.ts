import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '@app/core/toasts';
import { type DialogButton, DialogComponent } from '@app/shared/dialog';
import type { VehicleCreate, VehicleTypeGet } from '@gapp/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerTrash } from '@ng-icons/tabler-icons';
import { type OptionDefinition, SelectInputComponent, TextInputComponent } from '@shared/forms';
import { VehicleService } from '@shared/services';
import { distinctUntilChanged, filter, map, tap } from 'rxjs';

@Component({
    selector: 'create-vehicle',
    templateUrl: './create-vehicle.component.html',
    imports: [ReactiveFormsModule, TextInputComponent, SelectInputComponent, NgIcon, DialogComponent],
    providers: [provideIcons({ tablerTrash })],
})
export class CreateVehicleComponent {
    private vehiclesService = inject(VehicleService);
    private formBuilder = inject(FormBuilder);
    private toastService = inject(ToastService);

    private selectedType: VehicleTypeGet | undefined;

    public dialogRef = viewChild.required<DialogComponent>('dialog');
    public vehicleTypes = computed<OptionDefinition[]>(() =>
        this.vehiclesService.vehicleTypesList().map((type) => ({ label: type.type_name, value: type.id })),
    );
    public form = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(32)]],
        description: [],
        vehicle_type_id: [0, Validators.required],
        beacons: this.formBuilder.nonNullable.array([
            this.formBuilder.nonNullable.group({
                callsign: ['', [Validators.required, Validators.maxLength(32)]],
            }),
        ]),
    });
    public showBeacons = signal(false);
    public dialogButtons: DialogButton[] = [{ label: 'Create', style: 'btn-primary', action: () => this.createVehicle() }];
    public beaconsInput = this.form.get('beacons') as FormArray;

    constructor() {
        this.form.valueChanges
            .pipe(
                map((value) => this.vehiclesService.vehicleTypesList().find((type) => type.id === value.vehicle_type_id)),
                tap((type) => (this.selectedType = type)),
                distinctUntilChanged((prev, curr) => prev === curr),
                takeUntilDestroyed(),
            )
            .subscribe((type) => {
                if (type?.is_station) {
                    this.beaconsInput.clear();
                    this.showBeacons.set(false);
                } else {
                    this.showBeacons.set(true);
                }

                if (this.beaconsInput.controls.length === 0 && type?.is_station === false) {
                    this.showBeacons.set(true);
                    this.addBeacon();
                }
            });
    }

    public getTransmitterPlaceholder(index: number) {
        return `${this.form.get('name')?.value || 'CALLSIGN'}_${index + 1}`;
    }

    public createVehicle() {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        const vehicle = this.form.value as unknown as VehicleCreate;

        if (this.selectedType?.is_station) {
            vehicle.beacons = [
                {
                    callsign: vehicle.name,
                },
            ];
        }

        this.vehiclesService
            .createVehicle$(vehicle)
            .pipe(filter((response) => !!response.data))
            .subscribe(() => {
                this.toastService.toast('alert-success', 'Vehicle created successfully.');
                this.form.reset();
                this.form.markAsUntouched();
                this.showBeacons.set(false);
                this.dialogRef().close();
            });
    }

    public addBeacon() {
        this.beaconsInput.push(
            this.formBuilder.nonNullable.group({
                callsign: ['', [Validators.required, Validators.maxLength(32)]],
            }),
        );
    }

    public removeBeacon(index: number) {
        this.beaconsInput.removeAt(index);
    }

    public open() {
        this.dialogRef().open();
    }
}
