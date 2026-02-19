import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
    selector: 'telemetry-detail',
    templateUrl: './telemetry-detail.component.html',
    imports: [],
})
export class TelemetryDetailComponent {
    private activatedRoute = inject(ActivatedRoute);

    public id = toSignal(this.activatedRoute.paramMap.pipe(map((params) => params.get('vehicleId'))));
}
