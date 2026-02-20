import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from '@app/core/toasts/toasts.component';
import { HeaderComponent } from '@core/components/header/header.component';
import { HeaderService } from '@core/components/header/header.service';
import { NavbarComponent } from '@core/components/navbar/navbar.component';
import { ThemeService } from '@core/services/theme.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    imports: [RouterOutlet, NavbarComponent, ToastsComponent, HeaderComponent],
})
export class App {
    private headerService = inject(HeaderService);
    private themeService = inject(ThemeService);

    public readonly headerTitle = this.headerService.title;
    public readonly showHeader = this.headerService.showHeader;
    public readonly headerContent = this.headerService.content;
}
