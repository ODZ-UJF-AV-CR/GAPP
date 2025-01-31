import { GappLayoutDirective } from '@/directives/gapp-layout.directive';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalComponent } from '@/components/modal/modal.component';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { ToastService } from '@/services/toast.service';
import { HeaderComponent } from '@/components/header/header.component';
import { Vessel, VesselsService, VesselType } from '@/services/vessels.service';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { tablerTrash, tablerAirBalloon, tablerDrone } from '@ng-icons/tabler-icons';
import { ApiResponse } from '@/services/api.service.base';

@Component({
    selector: 'gapp-vessels',
    templateUrl: './vessels.component.html',
    imports: [GappLayoutDirective, ModalComponent, ReactiveFormsModule, HeaderComponent, NgIcon],
    providers: [provideIcons({ tablerTrash, tablerAirBalloon, tablerDrone }), provideNgIconsConfig({ size: '1rem' })],
})
export class VesselsComponent implements OnInit {
    private vesselsService = inject(VesselsService);
    private formBuilder = inject(FormBuilder);
    private toastService = inject(ToastService);
    private destroyRef = inject(DestroyRef);

    public vesselsSignal = signal<ApiResponse<Vessel[]>>({ loading: true });
    public readonly isVesselModalOpened = signal(false);
    public readonly errorMessage = signal<string | undefined>(undefined);
    public readonly vesselTypes = Object.values(VesselType);

    public readonly vesselForm = this.formBuilder.group({
        callsign: ['', Validators.required],
        transmitters: this.formBuilder.array([this.getTransmitterControl()], Validators.required),
        type: [VesselType.BALLOON],
        description: [null],
    });

    public ngOnInit() {
        this.loadVessels();
    }

    private loadVessels() {
        this.vesselsService
            .getVessels$()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                this.vesselsSignal.set(response);
            });
    }

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
                callsign: this.vesselForm.value.callsign || '',
                transmitters: this.vesselForm.value.transmitters?.map((t) => t.transmitter as string) || [],
                type: this.vesselForm.value.type as VesselType,
                description: this.vesselForm.value.description || '',
            })
            .pipe(
                filter((data) => !data.loading),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((result) => {
                if (result.error) {
                    this.errorMessage.set(result.error.message);
                    return;
                }

                this.isVesselModalOpened.set(false);
                this.toastService.toast('alert-success', `Vessel added`);
                this.loadVessels();
                this.vesselForm.reset();
            });
    }

    public deleteVessel(id: string) {
        this.vesselsService
            .deleteVessel$(id)
            .pipe(
                filter((data) => !data.loading),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.loadVessels();
            });
    }

    public hasError(fieldName: string) {
        const field = this.vesselForm.get(fieldName);
        return !field?.valid && (field?.dirty || field?.touched);
    }
}
