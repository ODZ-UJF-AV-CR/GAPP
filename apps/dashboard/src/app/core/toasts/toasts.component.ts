import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
    selector: 'gapp-toasts',
    templateUrl: './toasts.component.html',
    styleUrl: './toasts.component.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass],
})
export class ToastsComponent {
    public toasts = inject(ToastService).toasts;
}
