import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@/components/navbar/navbar.component';
import { ToastsComponent } from '@/components/toasts/toasts.component';
import { MenuComponent } from '@/components/menu/menu.component';

@Component({
    selector: 'gapp-root',
    templateUrl: './layout.component.html',
    imports: [RouterOutlet, NavbarComponent, ToastsComponent, MenuComponent]
})
export class LayoutComponent {}
