import { Directive, HostListener, inject, input, OnDestroy, output, TemplateRef } from '@angular/core';
import { DialogButton } from './dialog.component';
import { DialogRef, DialogService } from './dialog.service';

@Directive({
    selector: '[dialog]',
})
export class DialogDirective implements OnDestroy {
    private dialogService = inject(DialogService);

    private dialogRef!: DialogRef;
    private buttons: DialogButton[] = [
        {
            label: 'Delete',
            style: 'btn-error',
            action: () => {
                this.dialogRef.close();
                this.dialogResolved.emit(void 0);
            },
        },
    ];

    public readonly dialog = input.required<string | TemplateRef<unknown>>();
    public readonly title = input<string>();
    public readonly dialogResolved = output<void>();

    @HostListener('click')
    public openDialog() {
        this.dialogRef = this.dialogService.open(this.dialog(), {
            title: this.title(),
            buttons: this.buttons,
        });
    }

    public ngOnDestroy(): void {
        this.dialogRef?.close();
    }
}
