import { NgClass } from '@angular/common';
import { booleanAttribute, Component, effect, ElementRef, Input, input, output, Signal, signal, viewChild } from '@angular/core';
import { TextLimitDirective } from '../utils';

export interface DialogButton {
    label: string;
    style?: string;
    action: (event: MouseEvent) => void;
}

@Component({
    selector: 'gapp-dialog',
    templateUrl: './dialog.component.html',
    imports: [NgClass, TextLimitDirective],
})
export class DialogComponent {
    private readonly modalRef = viewChild.required<ElementRef<HTMLDialogElement>>('modal');

    @Input() set buttons(value: DialogButton[]) {
        this._buttons.set(value);
    }
    get buttons(): Signal<DialogButton[]> {
        return this._buttons;
    }

    @Input() set title(value: string) {
        this._title.set(value);
    }
    get title(): Signal<string> {
        return this._title;
    }

    private _buttons = signal<DialogButton[]>([]);
    private _title = signal<string>('');

    public readonly isOpen = input(false, { transform: booleanAttribute });
    public readonly content = input('');
    public readonly modalClass = input<string | string[]>('');
    public readonly closeButton = input<string | null>('Close');
    public readonly closed = output<void>();

    constructor() {
        effect(() => {
            if (this.isOpen()) {
                this.open();
            } else {
                this.close();
            }
        });
    }

    public open() {
        this.modalRef().nativeElement.showModal();
    }

    public close() {
        this.modalRef().nativeElement.close();
    }
}
