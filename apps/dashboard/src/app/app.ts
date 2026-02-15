import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from '@app/core/toasts/toasts.component';
import { MenuComponent } from '@core/components/menu/menu.component';
import { NavbarComponent } from '@core/components/navbar/navbar.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    imports: [RouterOutlet, NavbarComponent, ToastsComponent, MenuComponent],
})
export class App {}
