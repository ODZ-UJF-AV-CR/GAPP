import { ApplicationRef, type ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { type DialogButton, DialogComponent } from './dialog.component';
import { DOCUMENT } from '@angular/common';

export type DialogContent<C> = string | Type<C> | TemplateRef<unknown>;

export interface DialogOptions {
    buttons?: DialogButton[];
    title?: string;
    closeOtherDialogs?: boolean;
}

export interface DialogRef {
    close: () => void;
}

export interface DialogRefWithComponent<T> extends DialogRef {
    componentInstance: T;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
    private environmentInjector = inject(EnvironmentInjector);
    private applicationRef = inject(ApplicationRef);
    private document = inject(DOCUMENT);

    private closeCallbacks: (() => void)[] = [];

    public open(content: string, vcrOrOptions?: DialogOptions, options?: never): DialogRef;

    public open(content: TemplateRef<unknown>, vcrOrOptions: ViewContainerRef, options?: DialogOptions): DialogRef;

    public open<C>(content: Type<C>, vcrOrOptions?: DialogOptions, options?: never): DialogRefWithComponent<C>;

    public open<C>(content: DialogContent<C>, vcrOrOptions?: ViewContainerRef | DialogOptions, options?: DialogOptions): DialogRef | DialogRefWithComponent<C> {
        options = vcrOrOptions instanceof ViewContainerRef ? options : vcrOrOptions;

        if (options?.closeOtherDialogs !== false) {
            this.closeCallbacks.forEach((cb) => cb());
            this.closeCallbacks = [];
        }

        let projectableNodes: Node[] = [];
        let componentInstance: ComponentRef<C> | undefined ;

        if (typeof content === 'string') {
            projectableNodes = [this.document.createTextNode(content)];
        } else if (content instanceof Type) {
            componentInstance = createComponent(content, { environmentInjector: this.environmentInjector });
            projectableNodes = componentInstance.location.nativeElement;
        } else if (content instanceof TemplateRef && vcrOrOptions instanceof ViewContainerRef) {
            vcrOrOptions.clear();
            projectableNodes = vcrOrOptions.createEmbeddedView(content).rootNodes;
        } else {
            throw 'Not valid input provided as dialog content';
        }

        const modalComponent = createComponent(DialogComponent, {
            environmentInjector: this.environmentInjector,
            projectableNodes: [projectableNodes],
        });

        modalComponent.instance.buttons = options?.buttons || [];
        modalComponent.instance.title = options?.title || '';

        this.document.body.appendChild(modalComponent.location.nativeElement);
        this.applicationRef.attachView(modalComponent.hostView);

        const closedSubscription = modalComponent.instance.closed.subscribe(() => closeCallback());

        const closeCallback = () => {
            modalComponent.instance.close();
            modalComponent.destroy();
            componentInstance?.destroy();
            closedSubscription.unsubscribe();
        };

        this.closeCallbacks.push(closeCallback);
        setTimeout(() => modalComponent.instance.open(), 0);

        return {
            componentInstance: componentInstance?.instance,
            close: () => {
                closeCallback();
                this.closeCallbacks = this.closeCallbacks.filter((cb) => cb !== closeCallback);
            },
        };
    }
}
