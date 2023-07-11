import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-overlapped-dates',
  templateUrl: './overlapped-dates.component.html',
  styleUrls: ['./overlapped-dates.component.css']
})
export class OverlappedDatesComponent {
  constructor(public dialogRef: MatDialogRef<OverlappedDatesComponent>) {}

  onReselect(): void {
    this.dialogRef.close('reselect');
  }

  onContinue(): void {
    this.dialogRef.close('continue');
  }
}