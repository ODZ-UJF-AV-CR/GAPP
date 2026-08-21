import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GappMapComponent, type Layer } from '@shared/components/gapp-map';

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [GappMapComponent],
})
export class MapComponent {
    public readonly layers: Layer[] = [
        {
            layerId: 'path-layer',
            type: 'line',
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': 'red',
                'line-width': 8,
                'line-opacity': 0.5,
            },
            data: signal({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [15, 50],
                                [16, 50.01],
                                [16, 50.5],
                            ],
                        },
                    },
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [14, 49],
                                [15, 49.01],
                                [15, 49.5],
                            ],
                        },
                    },
                ],
            }),
        },
    ];
}
