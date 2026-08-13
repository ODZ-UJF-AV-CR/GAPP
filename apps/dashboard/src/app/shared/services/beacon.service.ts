import { Injectable, inject } from '@angular/core';
import type { BeaconGet, BeaconsCreate } from '@gapp/shared';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class BeaconService {
    private apiService = inject(ApiService);

    public createBeacons$(beacons: BeaconsCreate) {
        return this.apiService.post$<BeaconGet[]>('/beacons', beacons);
    }

    public deleteBeacon$(id: number) {
        return this.apiService.delete$(`/beacons/${id}`);
    }
}
