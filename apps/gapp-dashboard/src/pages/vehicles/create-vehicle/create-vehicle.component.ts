import { ToastService } from '@/services/toast.service';
import { VehicleCreate, VehicleService, VehicleType } from '@/services/vehicle.service';
import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OptionDefinition, SelectInputComponent, TextInputComponent } from '@gapp/forms-ui';
import { DialogButton, DialogComponent } from '@gapp/ui/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerTrash } from '@ng-icons/tabler-icons';
import { distinctUntilChanged, filter } from 'rxjs';

@Component({
    selector: 'create-vehicle',
    templateUrl: './create-vehicle.component.html',
    imports: [ReactiveFormsModule, TextInputComponent, SelectInputComponent, NgIcon, DialogComponent],
    providers: [provideIcons({ tablerTrash })],
})
export class CreateVehicleComponent {
    private vehiclesService = inject(VehicleService);
    private formBuilder = inject(FormBuilder);
    private destroyRef = inject(DestroyRef);
    private toastService = inject(ToastService);

    public dialogRef = viewChild.required<DialogComponent>('dialog');
    public vehicleTypes: OptionDefinition[] = Object.values(VehicleType).map((type) => ({ label: type, value: type }));
    public form = this.formBuilder.nonNullable.group({
        callsign: ['', [Validators.required, Validators.maxLength(32)]],
        description: [],
        type: ['', Validators.required],
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
                takeUntilDestroyed(this.destroyRef),
                distinctUntilChanged((prev, curr) => prev.type === curr.type)
            )
            .subscribe(({ type }) => {
                if (type === VehicleType.CAR) {
                    this.beaconsInput.clear();
                    this.showBeacons.set(false);
                } else {
                    this.showBeacons.set(true);
                }

                if (this.beaconsInput.controls.length === 0 && type !== VehicleType.CAR) {
                    this.showBeacons.set(true);
                    this.addBeacon();
                }
            });
    }

    public getTransmitterPlaceholder(index: number) {
        return `${this.form.get('callsign')?.value || 'CALLSIGN'}_${index + 1}`;
    }

    public createVehicle() {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        const vehicle = this.form.value as unknown as VehicleCreate;

        if (vehicle.type === VehicleType.CAR) {
            vehicle.beacons = [
                {
                    callsign: vehicle.callsign,
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
            })
        );
    }

    public removeBeacon(index: number) {
        this.beaconsInput.removeAt(index);
    }

    public open() {
        this.dialogRef().open();
    }
}
