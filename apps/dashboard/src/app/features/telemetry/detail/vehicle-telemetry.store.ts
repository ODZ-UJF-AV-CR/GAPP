import { computed, Injectable, inject, signal } from '@angular/core';
import { ApiService, type SseStatus } from '@core/services/api.service';
import type { TelemetryRecord, VehicleTelemetryStream } from '@gapp/shared';
import { finalize, retry, tap } from 'rxjs';

export interface TelemetryLogEntry {
    key: string;
    time: string;
    callsign: string;
    json: string;
    record: TelemetryRecord;
}

const RECONNECT_DELAY_MS = 3000;
const MAX_ENTRIES = 5000;

/**
 * Callsign and time are the InfluxDB point key, so two packets never share it. The timestamp is parsed because
 * the snapshot is formatted by InfluxDB while a live packet keeps the string the receiver sent.
 */
const entryKey = (record: TelemetryRecord) => `${record.callsign}|${Date.parse(record._time)}`;

const toEntry = (record: TelemetryRecord): TelemetryLogEntry => ({
    key: entryKey(record),
    time: record._time,
    callsign: record.callsign,
    json: JSON.stringify(record),
    record,
});

@Injectable()
export class VehicleTelemetryStore {
    private apiService = inject(ApiService);

    private status = signal<SseStatus>('idle');
    private log = signal<TelemetryLogEntry[]>([]);
    private seenKeys = new Set<string>();

    public connectionStatus = this.status.asReadonly();
    public entries = this.log.asReadonly();
    public count = computed(() => this.log().length);

    public connect$(vehicleId: number) {
        this.log.set([]);
        this.seenKeys.clear();

        return this.apiService
            .sse$<VehicleTelemetryStream>(`/live-data/vehicles/${vehicleId}`, (status) => this.status.set(status))
            .pipe(
                tap(({ telemetry }) => this.prepend(telemetry)),
                retry({ delay: RECONNECT_DELAY_MS }),
                finalize(() => this.status.set('idle')),
            );
    }

    /** @description The whole snapshot is replayed after every reconnect, so already known packets are dropped */
    private prepend(records: TelemetryRecord[]) {
        const fresh = records.filter((record) => !this.seenKeys.has(entryKey(record)));

        if (!fresh.length) {
            return;
        }

        fresh.forEach((record) => this.seenKeys.add(entryKey(record)));

        this.log.update((current) => {
            // the snapshot arrives oldest first, the newest packet belongs on top
            const next = [...fresh.reverse().map(toEntry), ...current];
            next.splice(MAX_ENTRIES).forEach((dropped) => this.seenKeys.delete(dropped.key));

            return next;
        });
    }
}
