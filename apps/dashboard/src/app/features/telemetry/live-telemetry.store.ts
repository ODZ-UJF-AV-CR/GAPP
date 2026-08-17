import { computed, Injectable, inject, signal, type WritableSignal } from '@angular/core';
import { ApiService, type SseStatus } from '@core/services/api.service';
import type { DashboardStream } from '@gapp/shared';
import { finalize, retry, share, tap } from 'rxjs';

export type BeaconContactData = DashboardStream['telemetry'][number];
export type BeaconUploadData = DashboardStream['uploaderContact'][number];

const RECONNECT_DELAY_MS = 3000;

const contactCompare = (prev: BeaconContactData | undefined, next: BeaconContactData | undefined) =>
    prev?._time === next?._time && prev?.uploader_callsign === next?.uploader_callsign;

const uploadCompare = (prev: BeaconUploadData | undefined, next: BeaconUploadData | undefined) => prev?._time === next?._time;

/**
 * Holds the live position of every beacon, keyed by callsign and independent of the vehicle list, so reloading
 * vehicles never drops contact state. The stream is shared and closes once the last consumer unsubscribes.
 */
@Injectable({ providedIn: 'root' })
export class LiveTelemetryStore {
    private apiService = inject(ApiService);

    private contacts = new Map<string, WritableSignal<BeaconContactData | undefined>>();
    private uploads = new Map<string, WritableSignal<BeaconUploadData | undefined>>();
    private status = signal<SseStatus>('idle');

    public connectionStatus = this.status.asReadonly();
    public isLive = computed(() => this.status() === 'live');

    private stream$ = this.apiService
        .sse$<DashboardStream>('/live-data/dashboard', (status) => this.status.set(status))
        .pipe(
            tap((data) => this.applyUpdate(data)),
            retry({ delay: RECONNECT_DELAY_MS }),
            finalize(() => this.status.set('idle')),
            share(),
        );

    public connect$() {
        return this.stream$;
    }

    public contactFor(callsign: string) {
        return this.signalFor(this.contacts, callsign, contactCompare);
    }

    public uploadFor(callsign: string) {
        return this.signalFor(this.uploads, callsign, uploadCompare);
    }

    private applyUpdate({ telemetry, uploaderContact }: DashboardStream) {
        telemetry.forEach((contact) => this.setIfNewer(this.contactFor(contact.callsign), contact));
        uploaderContact.forEach((upload) => this.setIfNewer(this.uploadFor(upload.uploader_callsign), upload));
    }

    /** @description The snapshot may be older than an update already applied, and it may repeat after every reconnect */
    private setIfNewer<T extends { _time: string }>(target: WritableSignal<T | undefined>, next: T) {
        const current = target();

        if (!current || Date.parse(next._time) >= Date.parse(current._time)) {
            target.set(next);
        }
    }

    private signalFor<T>(store: Map<string, WritableSignal<T | undefined>>, callsign: string, equal: (a: T | undefined, b: T | undefined) => boolean) {
        let target = store.get(callsign);

        if (!target) {
            target = signal<T | undefined>(undefined, { equal });
            store.set(callsign, target);
        }

        return target;
    }
}
