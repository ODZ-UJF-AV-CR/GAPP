import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'loader',
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div class="flex flex-row justify-center">
            <span class="loading loading-dots loading-lg"></span>
        </div>
    `,
})
export class LoaderComponent {}
