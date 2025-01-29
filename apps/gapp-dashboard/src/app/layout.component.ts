import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '@/components/menu/menu.component';

@Component({
    selector: 'gapp-root',
    templateUrl: './layout.component.html',
    imports: [RouterOutlet, MenuComponent],
})
export class LayoutComponent {}
