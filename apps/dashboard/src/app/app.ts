import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '@core/components/menu/menu.component';
import { NavbarComponent } from '@core/components/navbar/navbar.component';
import { ToastsComponent } from '@core/components/toasts/toasts.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    imports: [RouterOutlet, NavbarComponent, ToastsComponent, MenuComponent],
})
export class App {}
