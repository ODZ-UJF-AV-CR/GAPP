import { ApplicationRef, createComponent, EnvironmentInjector, inject, Injectable } from '@angular/core';
import { DialogButton, DialogComponent } from './dialog.component';
import { DOCUMENT } from '@angular/common';

export type DialogContent = string;

export interface DialogOptions {
    buttons: DialogButton[];
    title: string;
    closeOtherDialogs: boolean;
}

export interface DialogRef {
    close: () => void;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
    private environmentInjector = inject(EnvironmentInjector);
    private applicationRef = inject(ApplicationRef);
    private document = inject(DOCUMENT);

    private closeCallbacks: (() => void)[] = [];

    public open(content: DialogContent, options?: Partial<DialogOptions>): DialogRef {
        if (options?.closeOtherDialogs !== false) {
            this.closeCallbacks.forEach((cb) => cb());
            this.closeCallbacks = [];
        }

        const modalComponent = createComponent(DialogComponent, {
            environmentInjector: this.environmentInjector,
            projectableNodes: [[this.document.createTextNode(content)]],
        });

        modalComponent.instance.buttons = options?.buttons || [];
        modalComponent.instance.title = options?.title || '';

        this.document.body.appendChild(modalComponent.location.nativeElement);
        this.applicationRef.attachView(modalComponent.hostView);

        setTimeout(() => modalComponent.instance.open(), 0);

        const closeCallback = () => {
            modalComponent.instance.close();
            modalComponent.destroy();
        };

        this.closeCallbacks.push(closeCallback);

        return {
            close: () => {
                closeCallback();
                this.closeCallbacks = this.closeCallbacks.filter((cb) => cb !== closeCallback);
            },
        };
    }
}
