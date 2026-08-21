import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GappMapComponent, type SymbolLayer } from '@shared/components/gapp-map';

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [GappMapComponent],
})
export class MapComponent {
    public readonly layer: SymbolLayer = {
        layerId: 'baloon-layer',
        type: 'symbol',
        layout: {
            'icon-image': 'chase-car',
            'icon-size': 0.5,
            'icon-overlap': 'always',
        },
        data: signal({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: [14, 50],
                    },
                },
            ],
        }),
    };
}
