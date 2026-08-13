import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, HeaderService } from '@core/components/header';
import { NavbarComponent } from '@core/components/navbar/navbar.component';
import { ROUTE_DATA } from '@core/layout/route-data.provider';
import { ThemeService } from '@core/services/theme.service';
import { ToastsComponent } from '@core/toasts';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, NavbarComponent, ToastsComponent, HeaderComponent],
})
export class App {
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Injection needed for initialization
    private _themeService = inject(ThemeService);
    private headerService = inject(HeaderService);
    private routeData = inject(ROUTE_DATA);

    public readonly headerTitle = this.headerService.title;
    public readonly showHeader = this.headerService.showHeader;
    public readonly headerContent = this.headerService.content;
    public readonly headerBack = this.headerService.back;
    public readonly fullScreen = computed(() => this.routeData().fullScreen ?? false);
}
