import { Component } from '@angular/core';

@Component({
    selector: 'gapp-homepage',
    templateUrl: './homepage.component.html',
})
export class HomepageComponent {
    public closed() {
        console.log('modal is closed');
    }
}
