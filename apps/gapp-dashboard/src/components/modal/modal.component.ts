import { Component, effect, ElementRef, input, output, ViewChild } from '@angular/core';

@Component({
    selector: 'gapp-modal',
    templateUrl: './modal.component.html',
})
export class ModalComponent {
    @ViewChild('modal', { static: true }) public modalRef!: ElementRef<HTMLDialogElement>;

    public readonly isOpen = input(false);
    public readonly title = input('');
    public readonly closed = output<void>();

    constructor() {
        effect(() => {
            if (this.isOpen()) {
                this.modalRef.nativeElement.showModal();
            } else {
                this.modalRef.nativeElement.close();
            }
        });
    }
}
