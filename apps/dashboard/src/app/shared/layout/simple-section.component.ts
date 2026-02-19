import { Component, input } from '@angular/core';

@Component({
    selector: 'simple-section',
    templateUrl: './simple-section.component.html',
})
export class SimpleSectionComponent {
    public readonly title = input<string>();
}
