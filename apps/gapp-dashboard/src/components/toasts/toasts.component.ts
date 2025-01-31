import { ToastService } from '@/services/toast.service';
import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
    selector: 'gapp-toasts',
    templateUrl: './toasts.component.html',
    imports: [NgClass],
})
export class ToastsComponent {
    public toastService = inject(ToastService);
}
