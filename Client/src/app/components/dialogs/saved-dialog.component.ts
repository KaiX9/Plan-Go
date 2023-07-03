import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-saved-dialog',
  templateUrl: './saved-dialog.component.html',
  styleUrls: ['./saved-dialog.component.css']
})
export class SavedDialogComponent {
  constructor(public dialogRef: MatDialogRef<SavedDialogComponent>) {}  

  close() {
    this.dialogRef.close();
  }
}