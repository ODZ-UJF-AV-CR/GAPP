import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GappMapComponent } from '@shared/components/gapp-map';

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [GappMapComponent],
})
export class MapComponent {}
