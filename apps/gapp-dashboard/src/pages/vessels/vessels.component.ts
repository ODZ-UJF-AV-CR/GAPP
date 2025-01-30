import { GappLayoutDirective } from '@/directives/gapp-layout.directive';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ModalComponent } from '@/components/modal/modal.component';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { ToastService } from '@/services/toast.service';
import { HeaderComponent } from '@/components/header/header.component';
import { VesselsService, VesselType } from '@/services/vessels.service';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { tablerTrash } from '@ng-icons/tabler-icons';

@Component({
    selector: 'gapp-vessels',
    templateUrl: './vessels.component.html',
    imports: [GappLayoutDirective, ModalComponent, ReactiveFormsModule, HeaderComponent, NgIcon],
    providers: [provideIcons({ tablerTrash }), provideNgIconsConfig({ size: '1rem' })],
})
export class VesselsComponent {
    private vesselsService = inject(VesselsService);
    private formBuilder = inject(FormBuilder);
    private toastService = inject(ToastService);

    public readonly vesselsSignal = toSignal(this.vesselsService.getVessels$());
    public readonly isVesselModalOpened = signal(false);
    public readonly errorMessage = signal<string | undefined>(undefined);
    public readonly vesselTypes = Object.values(VesselType);

    public readonly vesselForm = this.formBuilder.group({
        callsign: ['', Validators.required],
        transmitters: this.formBuilder.array([this.getTransmitterControl()], Validators.required),
        type: [VesselType.BALLOON],
        description: [null],
    });

    public get transmitters() {
        return this.vesselForm.get('transmitters') as FormArray;
    }

    private getTransmitterControl() {
        return this.formBuilder.group({
            id: Date.now(),
            transmitter: ['', Validators.required],
        });
    }

    public removeTransmitter(index: number): void {
        if (this.transmitters.length > 1) {
            this.transmitters.removeAt(index);
        }
    }

    public addTransmitter() {
        this.transmitters.push(this.getTransmitterControl());
    }

    public openCarModal() {
        this.errorMessage.set(undefined);
        this.isVesselModalOpened.set(true);
    }

    public createVessel() {
        if (!this.vesselForm.valid) {
            this.vesselForm.markAllAsTouched();
            return;
        }

        this.vesselsService
            .createVessel$({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                callsign: this.vesselForm.value.callsign!,
                transmitters: this.vesselForm.value.transmitters?.map((t) => t.transmitter as string) || [],
                type: this.vesselForm.value.type as VesselType,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                description: this.vesselForm.value.description! as string,
            })
            .pipe(filter((data) => !data.loading))
            .subscribe((result) => {
                if (result.error) {
                    this.errorMessage.set(result.error.message);
                    return;
                }

                this.isVesselModalOpened.set(false);
                this.toastService.toast('alert-success', `Vessel added`);
            });
    }

    public hasError(fieldName: string) {
        const field = this.vesselForm.get(fieldName);
        return !field?.valid && (field?.dirty || field?.touched);
    }
}
