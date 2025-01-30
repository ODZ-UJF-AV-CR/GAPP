import { Component, input } from '@angular/core';

@Component({
    selector: 'gapp-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent {
    public readonly title = input<string>();
}
