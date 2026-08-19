import { ChangeDetectionStrategy, Component, computed, inject, type OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import type { ApiResponse } from '@core/services/api.service';
import type { VehicleGet } from '@gapp/shared';
import { VehicleIconComponent } from '@shared/components/vehicle-icon/vehicle-icon.component';
import { DialogComponent } from '@shared/dialog';
import { VehicleService } from '@shared/services';
import { LoaderComponent } from '@shared/utils';
import { map } from 'rxjs';
import { TelemetryLogComponent } from './telemetry-log.component';
import { type TelemetryLogEntry, VehicleTelemetryStore } from './vehicle-telemetry.store';

@Component({
    selector: 'telemetry-detail',
    templateUrl: './telemetry-detail.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderContentDirective, VehicleIconComponent, LoaderComponent, TelemetryLogComponent, DialogComponent],
    providers: [VehicleTelemetryStore],
})
export class TelemetryDetailComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute);
    private vehicleService = inject(VehicleService);
    private store = inject(VehicleTelemetryStore);

    private packetDialog = viewChild.required(DialogComponent);
    private vehicleResponse = signal<ApiResponse<VehicleGet>>({ loading: true });

    protected readonly vehicleId = toSignal(this.activatedRoute.paramMap.pipe(map((params) => Number(params.get('vehicleId')))), { requireSync: true });
    protected readonly vehicle = computed(() => this.vehicleResponse().data);
    protected readonly loading = computed(() => this.vehicleResponse().loading);
    protected readonly notFound = computed(() => !this.loading() && !this.vehicle());
    protected readonly beacons = computed(() => this.vehicle()?.beacons ?? []);

    protected readonly entries = this.store.entries;
    protected readonly packetCount = this.store.count;
    protected readonly connectionStatus = this.store.connectionStatus;

    protected readonly selectedEntry = signal<TelemetryLogEntry | undefined>(undefined);
    protected readonly selectedJson = computed(() => {
        const entry = this.selectedEntry();
        return entry ? JSON.stringify(entry.record, null, 2) : '';
    });

    constructor() {
        this.store.connect$(this.vehicleId()).pipe(takeUntilDestroyed()).subscribe();
    }

    public ngOnInit() {
        this.vehicleService.loadVehicleTypes();
        this.vehicleService.getVehicle$(this.vehicleId()).subscribe((response) => this.vehicleResponse.set(response));
    }

    protected showPacket(entry: TelemetryLogEntry) {
        this.selectedEntry.set(entry);
        this.packetDialog().open();
    }
}
