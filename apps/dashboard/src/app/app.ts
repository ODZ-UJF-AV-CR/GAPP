import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@/components/navbar/navbar.component';
import { ToastsComponent } from '@/components/toasts/toasts.component';
import { MenuComponent } from '@/components/menu/menu.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    imports: [RouterOutlet, NavbarComponent, ToastsComponent, MenuComponent],
})
export class App {}
