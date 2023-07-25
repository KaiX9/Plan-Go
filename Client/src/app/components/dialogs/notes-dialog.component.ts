import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-notes-dialog',
  templateUrl: './notes-dialog.component.html',
  styleUrls: ['./notes-dialog.component.css']
})
export class NotesDialogComponent {
  notesControl: any = FormControl;

  constructor(public dialogRef: MatDialogRef<NotesDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.notesControl = new FormControl(data.notes);
    }

  save() {
    this.dialogRef.close(this.notesControl.value);
  }
}