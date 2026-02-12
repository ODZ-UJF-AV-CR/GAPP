import { Component } from '@angular/core';

@Component({
    selector: 'scrollable',
    template: `
        <div class="max-h-[75vh] overflow-auto">
            <div class="flex gap-4 flex-col">
                <ng-content></ng-content>
            </div>
        </div>
    `,
})
export class ScrollableComponent {}
