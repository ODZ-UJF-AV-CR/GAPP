import { ChangeDetectionStrategy, Component, computed, inject, type OnInit, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import type { ApiResponse } from '@core/services/api.service';
import { ToastService } from '@core/toasts';
import type { BeaconsCreate, VehicleGet } from '@gapp/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerPlus, tablerTrash } from '@ng-icons/tabler-icons';
import { VehicleIconComponent } from '@shared/components/vehicle-icon/vehicle-icon.component';
import { type DialogButton, DialogDirective } from '@shared/dialog';
import { TextInputComponent } from '@shared/forms';
import { BeaconService, VehicleService } from '@shared/services';
import { LoaderComponent } from '@shared/utils';
import { concat, filter, map, type Observable, take, toArray } from 'rxjs';

type BeaconGroup = FormGroup<{
    id: FormControl<number | null>;
    callsign: FormControl<string>;
}>;

@Component({
    selector: 'vehicle-detail',
    templateUrl: './vehicle-detail.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, HeaderContentDirective, TextInputComponent, LoaderComponent, NgIcon, DialogDirective, VehicleIconComponent],
    providers: [provideIcons({ tablerTrash, tablerPlus })],
})
export class VehicleDetailComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private vehicleService = inject(VehicleService);
    private beaconService = inject(BeaconService);
    private toastService = inject(ToastService);
    private formBuilder = inject(FormBuilder);

    private deleteDialog = viewChild.required<DialogDirective>('deleteDialog');
    private vehicleResponse = signal<ApiResponse<VehicleGet>>({ loading: true });
    private removedBeaconIds = signal<number[]>([]);
    private loadedDescription = signal('');

    public vehicleId = toSignal(this.activatedRoute.paramMap.pipe(map((params) => Number(params.get('vehicleId')))), { requireSync: true });
    public vehicle = computed(() => this.vehicleResponse().data);
    public loading = computed(() => this.vehicleResponse().loading);
    public notFound = computed(() => !this.loading() && !this.vehicle());
    public saving = signal(false);
    public beaconsInput = new FormArray<BeaconGroup>([]);
    public form = this.formBuilder.nonNullable.group({
        description: [''],
        beacons: this.beaconsInput,
    });
    public deleteButtons: DialogButton[] = [
        { label: 'Close', style: 'btn-neutral', close: true },
        { label: 'Delete', style: 'btn-error', action: () => this.deleteVehicle() },
    ];

    private formState = toSignal(this.form.events);
    private changes = computed(() => {
        this.formState();
        const rows = this.beaconsInput.getRawValue();
        const description = this.form.controls.description.value;

        return {
            created: rows.filter((row) => row.id === null).map((row) => ({ callsign: row.callsign.trim(), vehicle_id: this.vehicleId() })) as BeaconsCreate,
            deleted: this.removedBeaconIds(),
            description: description === this.loadedDescription() ? undefined : description,
        };
    });

    public canSave = computed(() => {
        const { created, deleted, description } = this.changes();
        return created.length > 0 || deleted.length > 0 || description !== undefined;
    });

    public ngOnInit() {
        this.loadVehicle();
    }

    public addBeacon() {
        this.beaconsInput.push(this.createBeaconGroup(null, ''));
        this.form.markAsDirty();
    }

    public removeBeacon(index: number) {
        const { id } = this.beaconsInput.at(index).getRawValue();

        if (id !== null) {
            this.removedBeaconIds.update((ids) => [...ids, id]);
        }

        this.beaconsInput.removeAt(index);
        this.form.markAsDirty();
    }

    public save() {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        const operations = this.buildSaveOperations();

        if (!operations.length) {
            return;
        }

        this.saving.set(true);

        concat(...operations)
            .pipe(toArray())
            .subscribe((responses) => {
                this.saving.set(false);
                const error = responses.find((response) => response.error);

                if (error) {
                    this.toastService.toast('alert-error', error.error?.message ?? 'Could not save the vehicle.');
                    this.loadVehicle();
                    return;
                }

                this.toastService.toast('alert-success', 'Vehicle saved successfully.');
                this.router.navigate(['/vehicles']);
            });
    }

    public deleteVehicle() {
        this.vehicleService
            .deleteVehicle$(this.vehicleId())
            .pipe(this.firstResult())
            .subscribe(() => {
                this.toastService.toast('alert-warning', `Vehicle ${this.vehicle()?.name} deleted.`);
                this.deleteDialog().close();
                this.router.navigate(['/vehicles']);
            });
    }

    private buildSaveOperations() {
        const { created, deleted, description } = this.changes();
        const operations: Observable<ApiResponse<unknown>>[] = [];

        deleted.forEach((id) => operations.push(this.beaconService.deleteBeacon$(id).pipe(this.firstResult())));

        if (created.length) {
            operations.push(this.beaconService.createBeacons$(created).pipe(this.firstResult()));
        }

        if (description !== undefined) {
            operations.push(this.vehicleService.updateVehicle$(this.vehicleId(), { description }).pipe(this.firstResult()));
        }

        return operations;
    }

    private loadVehicle() {
        this.vehicleService
            .getVehicle$(this.vehicleId())
            .pipe(this.firstResult())
            .subscribe((response) => {
                this.vehicleResponse.set(response);

                if (response.data) {
                    this.seedForm(response.data);
                }
            });
    }

    private seedForm(vehicle: VehicleGet) {
        this.beaconsInput.clear();
        (vehicle.beacons ?? []).forEach((beacon) => this.beaconsInput.push(this.createBeaconGroup(beacon.id, beacon.callsign)));
        this.form.controls.description.setValue(vehicle.description ?? '');
        this.loadedDescription.set(vehicle.description ?? '');
        this.removedBeaconIds.set([]);
        this.form.markAsPristine();
        this.form.markAsUntouched();
    }

    /** @description Existing beacons cannot be renamed, they can only be removed and replaced by a new one */
    private createBeaconGroup(id: number | null, callsign: string): BeaconGroup {
        return new FormGroup({
            id: new FormControl<number | null>(id),
            callsign: new FormControl(
                { value: callsign, disabled: id !== null },
                { nonNullable: true, validators: [Validators.required, Validators.maxLength(32)] },
            ),
        });
    }

    private firstResult<T>() {
        return (source: Observable<ApiResponse<T>>) =>
            source.pipe(
                filter((response) => !response.loading),
                take(1),
            );
    }
}
