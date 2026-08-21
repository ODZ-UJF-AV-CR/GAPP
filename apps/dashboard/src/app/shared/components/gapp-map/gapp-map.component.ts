import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ImageComponent as MGLImageComponent, MapComponent as MGLMapComponent } from '@maplibre/ngx-maplibre-gl';
import type { Map as MapLibre, ProjectionSpecification } from 'maplibre-gl';
import { GAPP_MAP_ICONS, GAPP_MAP_TILES } from './gapp-map.provider';

@Component({
    selector: 'gapp-map',
    templateUrl: './gapp-map.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MGLMapComponent, MGLImageComponent],
    host: {
        class: 'w-full h-full block',
    },
})
export class GappMapComponent {
    public readonly mapTiles = inject(GAPP_MAP_TILES);
    protected readonly icons = inject(GAPP_MAP_ICONS, { optional: true }) ?? [];

    protected readonly projection: ProjectionSpecification = { type: 'globe' };

    public onMapLoad(map: MapLibre) {
        map.touchPitch.disable();
        map.touchZoomRotate.disableRotation();
        map.dragRotate.disable();
    }
}
