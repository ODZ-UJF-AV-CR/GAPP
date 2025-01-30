import { GappLayoutDirective } from '@/directives/gapp-layout.directive';
import { Component } from '@angular/core';

@Component({
    selector: 'gapp-homepage',
    templateUrl: './homepage.component.html',
    imports: [GappLayoutDirective],
})
export class HomepageComponent {
    public closed() {
        console.log('modal is closed');
    }
}
