import { Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { ToastService } from '@/services/toast.service';
import { Vessel, VesselsService, VesselType } from '@/services/vessels.service';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { tablerTrash, tablerAirBalloon, tablerDrone } from '@ng-icons/tabler-icons';
import { ApiResponse } from '@/services/api.service.base';
import { PageBlockComponent } from '@/components/page-block/page-block.component';
import { ScrollableComponent } from '@gapp/ui/scrollable';
import { LoaderComponent } from '@gapp/ui/loader';
import { ErrorClassDirective } from '@gapp/forms-ui';
import { DialogButton, DialogComponent, DialogDirective } from '@gapp/ui/dialog';
import { TextLimitDirective } from '@gapp/ui/utils';

@Component({
    selector: 'gapp-vessels',
    templateUrl: './vessels.component.html',
    imports: [
        DialogComponent,
        ReactiveFormsModule,
        NgIcon,
        PageBlockComponent,
        ScrollableComponent,
        LoaderComponent,
        ErrorClassDirective,
        DialogDirective,
        TextLimitDirective,
    ],
    providers: [provideIcons({ tablerTrash, tablerAirBalloon, tablerDrone }), provideNgIconsConfig({ size: '1rem' })],
})
export class VesselsComponent implements OnInit {
    private vesselsService = inject(VesselsService);
    private formBuilder = inject(FormBuilder);
    private toastService = inject(ToastService);
    private destroyRef = inject(DestroyRef);

    private addVesselDialog = viewChild.required<DialogComponent>('addVesselDialog');

    public vesselsSignal = signal<ApiResponse<Vessel[]>>({ loading: true });
    public readonly errorMessage = signal<string | undefined>(undefined);
    public readonly vesselTypes = Object.values(VesselType);

    public readonly vesselForm = this.formBuilder.group({
        callsign: ['', [Validators.required, Validators.minLength(1)]],
        transmitters: this.formBuilder.array([this.getTransmitterControl()], Validators.required),
        type: [VesselType.BALLOON, Validators.required],
        description: [null],
    });

    public get modalButton(): DialogButton {
        return {
            label: 'Create',
            style: 'btn-primary',
            action: () => this.createVessel(),
        };
    }

    public getControl(controlName: string) {
        return this.vesselForm.get(controlName) as AbstractControl;
    }

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
            transmitter: ['', [Validators.required, Validators.minLength(1)]],
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
        this.addVesselDialog().open();
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

                this.addVesselDialog().close();
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
