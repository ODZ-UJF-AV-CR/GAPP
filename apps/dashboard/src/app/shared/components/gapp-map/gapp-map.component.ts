import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import {
    GeoJSONSourceComponent as MGLGeoJSONSourceComponent,
    ImageComponent as MGLImageComponent,
    LayerComponent as MGLLayerComponent,
    MapComponent as MGLMapComponent,
} from '@maplibre/ngx-maplibre-gl';
import type { Map as MapLibre, ProjectionSpecification } from 'maplibre-gl';
import { GAPP_MAP_ICONS, GAPP_MAP_TILES } from './gapp-map.provider';
import type { Layer } from './types';

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

    public readonly initialZoom = input(9, { transform: numberAttribute });
    public readonly initialLocation = input<[number, number]>([14.4378, 50.0755]);
    public readonly layers = input<Layer[]>([]);

    protected readonly projection: ProjectionSpecification = { type: 'globe' };

    public onMapLoad(map: MapLibre) {
        map.touchPitch.disable();
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        map.keyboard.disableRotation();
    }
}
