import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderContentDirective } from '@core/components/header/header-content.directive';
import { GappMapComponent, type Layer } from '@shared/components/gapp-map';
import { VehicleService } from '@shared/services';
import { MapStore } from './map.store';

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [GappMapComponent, HeaderContentDirective],
})
export class MapComponent implements OnInit {
    private mapStore = inject(MapStore);
    private vehicleService = inject(VehicleService);

    protected readonly connectionStatus = this.mapStore.connectionStatus;

    // tracks come first so the markers stay painted on top of them
    protected readonly layers: Layer[] = [
        {
            layerId: 'vehicle-tracks',
            type: 'line',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#ef4444', 'line-width': 3, 'line-opacity': 0.7 },
            data: this.mapStore.trackFeatures,
        },
        {
            layerId: 'vehicle-markers',
            type: 'symbol',
            layout: {
                'icon-image': ['get', 'icon'],
                'icon-size': 1,
                'icon-offset': [0, -24],
                'icon-allow-overlap': true,
                'text-field': ['get', 'callsign'],
                'text-size': 13,
                'text-anchor': 'top',
                'text-offset': [0, 0],
                // a symbol is placed as a unit, so without this a colliding label would hide its icon too
                'text-optional': true,
            },
            paint: { 'text-color': '#111111', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
            data: this.mapStore.markerFeatures,
        },
    ];

    constructor() {
        this.mapStore.connect$().pipe(takeUntilDestroyed()).subscribe();
    }

    public ngOnInit() {
        this.vehicleService.loadVehicleTypes();
        this.vehicleService.loadVehicles(true);
    }
}
