import { Component, input } from '@angular/core';

@Component({
    selector: 'page-block',
    templateUrl: './page-block.component.html',
})
export class PageBlockComponent {
    public readonly title = input<string>();
}
