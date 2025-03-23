import { Directive, HostListener, inject, input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { DialogButton } from './dialog.component';
import { DialogRef, DialogService } from './dialog.service';

@Directive({
    selector: '[dialog]',
})
export class DialogDirective implements OnDestroy {
    private dialogService = inject(DialogService);

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
    public readonly vcr = input<ViewContainerRef>();
    public readonly title = input<string>();
    public readonly buttons = input<DialogButton[]>(this.defaultButtons);

    @HostListener('click')
    public openDialog() {
        const content = this.dialog();
        const vcr = this.vcr();

        if (content instanceof TemplateRef && vcr instanceof ViewContainerRef) {
            this.dialogRef = this.dialogService.open(content, vcr, {
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
