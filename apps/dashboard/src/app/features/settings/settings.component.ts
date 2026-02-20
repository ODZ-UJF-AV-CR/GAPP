import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CenterLayoutComponent, SimpleSectionComponent } from '@shared/layout';
import { ThemeSwitchComponent } from './theme-switch/theme-switch.component';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CenterLayoutComponent, SimpleSectionComponent, ThemeSwitchComponent],
})
export class SettingsComponent {}
