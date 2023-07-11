import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-authenticate-error',
  templateUrl: './authenticate-error.component.html',
  styleUrls: ['./authenticate-error.component.css']
})
export class AuthenticateErrorComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string },
    public dialogRef: MatDialogRef<AuthenticateErrorComponent>) {}  

  close() {
    this.dialogRef.close();
    location.reload();
  }
}