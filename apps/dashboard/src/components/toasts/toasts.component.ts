import { ToastService } from '@/services/toast.service';
import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
    selector: 'gapp-toasts',
    templateUrl: './toasts.component.html',
    styleUrl: './toasts.component.css',
    imports: [NgClass],
})
export class ToastsComponent {
    public toasts = inject(ToastService).toasts;
}
