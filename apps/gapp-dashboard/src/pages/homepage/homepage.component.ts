import { GappLayoutDirective } from '@/utils/gapp-layout.directive';
import { Component } from '@angular/core';

@Component({
    selector: 'gapp-homepage',
    templateUrl: './homepage.component.html',
    imports: [GappLayoutDirective],
})
export class HomepageComponent {}
