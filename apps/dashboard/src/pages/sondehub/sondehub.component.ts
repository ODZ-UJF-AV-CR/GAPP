import { VehicleService } from '@/services/vehicle.service';
import { Component, computed, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'sondehub',
    templateUrl: './sondehub.component.html',
})
export class SondehubComponent implements OnInit {
    private vehicleService = inject(VehicleService);
    private sanitizer = inject(DomSanitizer);

    public sondehubSource = computed(() => {
        const beaconsQuery = this.vehicleService
            .vehiclesList()
            .map((v) => v.beacons.map((b) => b.callsign))
            .join(',');
        const url = encodeURI(`https://amateur.sondehub.org/index.html?embed=1&hidelist=1&hidegraph=1&expandgraph=0#!mt=Mapnik&q=${beaconsQuery}`);
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });

    public ngOnInit() {
        this.vehicleService.loadVehicles();
    }
}
