import { VehicleCreate, VehicleService, VehicleType } from '@/services/vehicle.service';
import { Component, inject, output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInputComponent } from '@gapp/forms-ui';

@Component({
    selector: 'create-vehicle',
    templateUrl: './create-vehicle.component.html',
    imports: [ReactiveFormsModule, TextInputComponent],
})
export class CreateVehicleComponent {
    private vehiclesService = inject(VehicleService);
    private formBuilder = inject(FormBuilder);

    public vehicleCreated = output<void>();

    public vehicleTypes = Object.values(VehicleType);

    public form = this.formBuilder.nonNullable.group({
        callsign: ['', [Validators.required, Validators.maxLength(5)]],
        description: [],
        type: ['', Validators.required],
        beacons: this.formBuilder.nonNullable.array(
            [
                this.formBuilder.nonNullable.group({
                    callsign: ['', Validators.required],
                }),
            ],
            Validators.required
        ),
    });

    private beaconsInput = this.form.get('beacons') as FormArray;

    public getControl(name: string) {
        return this.form.get(name) as FormControl;
    }

    public createVehicle() {
        const vehicle = this.form.value as unknown as VehicleCreate;

        console.log(vehicle);

        this.vehiclesService.createVehicle$(vehicle).subscribe(() => {
            this.vehicleCreated.emit();
            this.form.reset();
        });
    }

    public addBeacon() {
        this.beaconsInput.push(
            this.formBuilder.nonNullable.group({
                callsign: ['', Validators.required, Validators.maxLength(32)],
            })
        );
    }

    public removeBeacon(index: number) {
        this.beaconsInput.removeAt(index);
    }
}
