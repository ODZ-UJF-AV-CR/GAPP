import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';
import { MapComponent as MGLMapComponent } from '@maplibre/ngx-maplibre-gl';

const LIGHT_MAP_TILES = 'https://tiles.openfreemap.org/styles/liberty';
const DARK_MAP_TILES = 'https://tiles.openfreemap.org/styles/dark';

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MGLMapComponent],
})
export class MapComponent {
    private themeService = inject(ThemeService);

    public tilesSource = computed(() => (this.themeService.effectiveTheme() === 'light' ? LIGHT_MAP_TILES : DARK_MAP_TILES));
}
