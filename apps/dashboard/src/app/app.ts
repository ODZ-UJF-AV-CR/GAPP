import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, HeaderService } from '@core/components/header';
import { NavbarComponent } from '@core/components/navbar/navbar.component';
import { ToastsComponent } from '@core/toasts';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, NavbarComponent, ToastsComponent, HeaderComponent],
})
export class App {
    private headerService = inject(HeaderService);

    public readonly headerTitle = this.headerService.title;
    public readonly showHeader = this.headerService.showHeader;
    public readonly headerContent = this.headerService.content;
}
