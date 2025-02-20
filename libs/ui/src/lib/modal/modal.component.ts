import { Component, effect, ElementRef, input, output, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'gapp-modal',
    templateUrl: './modal.component.html',
    imports: [NgClass],
})
export class ModalComponent {
    @ViewChild('modal', { static: true }) public modalRef!: ElementRef<HTMLDialogElement>;

    public readonly isOpen = input(false);
    public readonly title = input('');
    public readonly width = input('');
    public readonly action = input<string | undefined>();
    public readonly closed = output<void>();
    public readonly actionUsed = output<void>();

    constructor() {
        effect(() => {
            if (this.isOpen()) {
                this.modalRef.nativeElement.showModal();
            } else {
                this.modalRef.nativeElement.close();
            }
        });
    }

    public open() {
        this.modalRef.nativeElement.showModal();
    }

    public close() {
        this.modalRef.nativeElement.close();
    }
}
