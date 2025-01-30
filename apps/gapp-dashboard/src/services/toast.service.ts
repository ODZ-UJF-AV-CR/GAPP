import { Injectable, signal } from '@angular/core';

export type ToastType = 'alert-info' | 'alert-warning' | 'alert-error' | 'alert-success';

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    public readonly toasts = signal<Toast[]>([]);

    public toast(type: ToastType, message: string, expiration = 2_000) {
        this.toasts.update((toasts) => {
            const id = this.generateToastId(toasts);
            this.setToastExpiration(id, expiration);

            return [...toasts, { type, id, message }];
        });
    }

    private generateToastId(toasts: Toast[]): number {
        let newId = 0;

        const currentIds = toasts.map((msg) => msg.id)?.sort((a, b) => a - b) || [];

        for (const id of currentIds) {
            if (id < newId) {
                break;
            } else if (id === newId) {
                newId++;
            }
        }

        return newId;
    }

    private setToastExpiration(id: number, expiration: number) {
        setTimeout(() => {
            this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
        }, expiration);
    }
}
