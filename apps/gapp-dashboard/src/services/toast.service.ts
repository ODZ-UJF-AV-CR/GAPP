import { Injectable, signal } from '@angular/core';
import { v4 as uuid } from 'uuid';

export type ToastType = 'alert-info' | 'alert-warning' | 'alert-error' | 'alert-success';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    public readonly toasts = signal<Toast[]>([]);

    public toast(type: ToastType, message: string, expiration = 2_000) {
        this.toasts.update((toasts) => {
            const toast: Toast = { type, message, id: uuid() };
            this.setToastExpiration(toast.id, expiration);
            return [...toasts, toast];
        });
    }

    private setToastExpiration(id: string, expiration: number) {
        setTimeout(() => {
            this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
        }, expiration);
    }
}
