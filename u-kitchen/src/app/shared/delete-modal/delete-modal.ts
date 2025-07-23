import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Employee } from '../../employees/employee.model.js';

@Component({
  selector: 'app-delete-modal',
  imports: [MatDialogActions, MatDialogTitle, MatDialogContent, MatButtonModule],
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.css'
})
export class DeleteModal {
  readonly dialogRef = inject(MatDialogRef<DeleteModal>);
  readonly data = inject(MAT_DIALOG_DATA);

  text: string;
  name: string;

  constructor() {
    this.text = this.data.text;
    this.name = this.data.name;
  }

  onDelete() {
    this.data.delete().subscribe({
      next: (res: any) => { console.log(res); this.dialogRef.close('deleted succesfully') },
      //idealmente: mostrar un snakbar con el error y no cerrar el dialog
      error: (error: any) => { console.log(error); this.dialogRef.close(error.message) }
    })
  }

  onCancel() {
    this.dialogRef.close('cancel')
  };
}
