import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeSwitchComponent } from './theme-switch/theme-switch.component';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    host: { class: 'flex flex-col items-center max-h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ThemeSwitchComponent],
})
export class SettingsComponent {}
