import { Directive, HostListener, inject, input, output } from '@angular/core';
import { DialogButton } from './dialog.component';
import { DialogRef, DialogService } from './dialog.service';

@Directive({
    selector: '[dialog]',
})
export class DialogDirective {
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

    public readonly dialog = input.required<string>();
    public readonly content = input.required<string>();
    public readonly dialogResolved = output<void>();

    @HostListener('click')
    public openDialog() {
        this.dialogRef = this.dialogService.open(this.content(), {
            title: this.dialog(),
            buttons: this.buttons,
        });
    }
}
