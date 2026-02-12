import { Directive, HostListener, inject, input, type OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import type { DialogButton } from './dialog.component';
import { type DialogRef, DialogService } from './dialog.service';

@Directive({
    selector: '[dialog]',
})
export class DialogDirective implements OnDestroy {
    private dialogService = inject(DialogService);
    private viewContainerRef = inject(ViewContainerRef);

    private dialogRef!: DialogRef;
    private defaultButtons: DialogButton[] = [
        {
            label: 'Delete',
            style: 'btn-error',
            action: () => {
                this.dialogRef.close();
            },
        },
    ];

    public readonly dialog = input.required<string | TemplateRef<unknown>>();
    public readonly title = input<string>();
    public readonly buttons = input<DialogButton[]>(this.defaultButtons);

    @HostListener('click')
    public openDialog() {
        const content = this.dialog();

        if (content instanceof TemplateRef) {
            this.dialogRef = this.dialogService.open(content, this.viewContainerRef, {
                title: this.title(),
                buttons: this.buttons(),
            });
        } else if (typeof content === 'string') {
            this.dialogRef = this.dialogService.open(content, {
                title: this.title(),
                buttons: this.buttons(),
            });
        } else {
            throw 'Content must be either a string or a TemplateRef';
        }
    }

    public ngOnDestroy(): void {
        this.dialogRef?.close();
    }
}
