import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeSwitchComponent } from './theme-switch/theme-switch.component';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ThemeSwitchComponent],
})
export class SettingsComponent {}
