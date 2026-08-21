import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    GeoJSONSourceComponent as MGLGeoJSONSourceComponent,
    ImageComponent as MGLImageComponent,
    LayerComponent as MGLLayerComponent,
    MapComponent as MGLMapComponent,
} from '@maplibre/ngx-maplibre-gl';
import type { Map as MapLibre, ProjectionSpecification, SymbolLayerSpecification } from 'maplibre-gl';
import { GAPP_MAP_ICONS, GAPP_MAP_TILES } from './gapp-map.provider';

@Component({
    selector: 'gapp-map',
    templateUrl: './gapp-map.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MGLMapComponent, MGLImageComponent, MGLGeoJSONSourceComponent, MGLLayerComponent],
    host: {
        class: 'w-full h-full block',
    },
})
export class GappMapComponent {
    public readonly mapTiles = inject(GAPP_MAP_TILES);
    protected readonly icons = inject(GAPP_MAP_ICONS, { optional: true }) ?? [];

    protected readonly projection: ProjectionSpecification = { type: 'globe' };

    protected readonly praguePoint: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [14.4378, 50.0755],
                },
                properties: {},
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [14.4378, 51.0755],
                },
                properties: {},
            },
        ],
    };

    protected readonly carLayerLayout: SymbolLayerSpecification['layout'] = {
        'icon-image': 'baloon',
        'icon-size': 0.5,
        'icon-allow-overlap': true,
    };

    public onMapLoad(map: MapLibre) {
        map.touchPitch.disable();
        map.touchZoomRotate.disableRotation();
        map.dragRotate.disable();
    }
}
