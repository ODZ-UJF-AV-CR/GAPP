import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeSwitchComponent } from './theme-switch/theme-switch.component';
import { UnitSwitchComponent } from './unit-switch/unit-switch.component';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full gap-2' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ThemeSwitchComponent, UnitSwitchComponent],
})
export class SettingsComponent {}
