import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { UnitSystem } from '@core/services/unit.provider';
import { UnitService } from '@core/services/unit.service';

@Component({
    selector: 'unit-switch',
    templateUrl: './unit-switch.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
})
export class UnitSwitchComponent {
    private unitService = inject(UnitService);
    public readonly availableSystems = this.unitService.getAvailableSystems();

    public isChecked(system: UnitSystem): boolean {
        return this.unitService.system() === system;
    }

    public selectSystem(system: UnitSystem) {
        this.unitService.setSystem(system);
    }
}
