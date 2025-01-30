import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '@/components/menu/menu.component';
import { ToastsComponent } from '@/components/toasts/toasts.component';

@Component({
    selector: 'gapp-root',
    templateUrl: './layout.component.html',
    imports: [RouterOutlet, MenuComponent, ToastsComponent],
})
export class LayoutComponent {}
