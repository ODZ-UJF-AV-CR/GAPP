import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import type { TelemetryRecord, VehicleGet, VehicleTelemetryStream } from '@gapp/shared';
import { provideVehicleIcons } from '@shared/components/vehicle-icon/vehicle-icon.provider';
import { of, Subject } from 'rxjs';
import { TelemetryDetailComponent } from './telemetry-detail.component';
import { TelemetryLogComponent } from './telemetry-log.component';
import type { TelemetryLogEntry } from './vehicle-telemetry.store';

// jsdom implements neither the dialog methods nor element scrolling, both are used as soon as the page renders
HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.open = true;
};
HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.open = false;
};
Element.prototype.scrollTo ??= () => {};

const vehicle: VehicleGet = {
    id: 1,
    name: 'balloon',
    description: null,
    vehicle_type_id: 1,
    upload_aggregation: true,
    upload_beacons: false,
    beacons: [
        { id: 10, callsign: 'tx-1' },
        { id: 11, callsign: 'tx-2' },
    ],
};

const record = (callsign: string, time: string): TelemetryRecord => ({
    callsign,
    latitude: 50,
    longitude: 14,
    altitude: 1000,
    _time: time,
});

describe('TelemetryDetailComponent', () => {
    let fixture: ComponentFixture<TelemetryDetailComponent>;
    let component: TelemetryDetailComponent;
    let stream: Subject<VehicleTelemetryStream>;

    // the rows themselves are not asserted on, a jsdom viewport has no height so the virtual scroller renders nothing
    const callsignsInLog = () =>
        fixture.debugElement
            .query(By.directive(TelemetryLogComponent))
            .componentInstance.entries()
            .map((entry: TelemetryLogEntry) => entry.callsign);

    const beaconButton = (callsign: string) =>
        Array.from(fixture.nativeElement.querySelectorAll('button.badge')).find(
            (button) => (button as HTMLElement).textContent?.trim() === callsign,
        ) as HTMLButtonElement;

    beforeEach(async () => {
        stream = new Subject<VehicleTelemetryStream>();

        await TestBed.configureTestingModule({
            imports: [TelemetryDetailComponent],
            providers: [
                provideVehicleIcons({ defaultIcon: '<svg></svg>', icons: {} }),
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ vehicleId: '1' })) } },
                {
                    provide: ApiService,
                    useValue: {
                        sse$: () => stream.asObservable(),
                        get$: (url: string) => of({ loading: false, data: url.startsWith('/vehicles/types') ? [] : vehicle }),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TelemetryDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        stream.next({
            telemetry: [record('tx-1', '2026-08-19T21:00:00.000Z'), record('tx-2', '2026-08-19T21:01:00.000Z'), record('tx-1', '2026-08-19T21:02:00.000Z')],
        });
        fixture.detectChanges();
    });

    it('shows every beacon until one is selected', () => {
        expect(callsignsInLog()).toEqual(['tx-1', 'tx-2', 'tx-1']);
    });

    it('keeps only the selected beacon', () => {
        beaconButton('tx-1').click();
        fixture.detectChanges();

        expect(callsignsInLog()).toEqual(['tx-1', 'tx-1']);
    });

    it('selects multiple beacons at once', () => {
        beaconButton('tx-1').click();
        beaconButton('tx-2').click();
        fixture.detectChanges();

        expect(callsignsInLog()).toEqual(['tx-1', 'tx-2', 'tx-1']);
    });

    it('shows everything again when the last beacon is deselected', () => {
        beaconButton('tx-2').click();
        fixture.detectChanges();
        expect(callsignsInLog()).toEqual(['tx-2']);

        beaconButton('tx-2').click();
        fixture.detectChanges();
        expect(callsignsInLog()).toEqual(['tx-1', 'tx-2', 'tx-1']);
    });

    it('marks the selected beacon as pressed', () => {
        beaconButton('tx-1').click();
        fixture.detectChanges();

        expect(beaconButton('tx-1').getAttribute('aria-pressed')).toBe('true');
        expect(beaconButton('tx-2').getAttribute('aria-pressed')).toBe('false');
    });

    it('applies the filter to packets arriving while it is active', () => {
        beaconButton('tx-1').click();
        fixture.detectChanges();

        stream.next({ telemetry: [record('tx-2', '2026-08-19T21:03:00.000Z')] });
        stream.next({ telemetry: [record('tx-1', '2026-08-19T21:04:00.000Z')] });
        fixture.detectChanges();

        expect(callsignsInLog()).toEqual(['tx-1', 'tx-1', 'tx-1']);
        expect(component['packetCount']()).toBe(5);
    });

    it('drops the filter when clear is pressed', () => {
        beaconButton('tx-1').click();
        fixture.detectChanges();

        const clear = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
            (button) => (button as HTMLElement).textContent?.trim() === 'Clear',
        ) as HTMLButtonElement;
        clear.click();
        fixture.detectChanges();

        expect(callsignsInLog()).toEqual(['tx-1', 'tx-2', 'tx-1']);
    });
});
