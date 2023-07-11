import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saved-guide',
  templateUrl: './saved-guide.component.html',
  styleUrls: ['./saved-guide.component.css']
})
export class SavedGuideComponent {
  constructor(public dialogRef: MatDialogRef<SavedGuideComponent>) {} 
  
  router = inject(Router);

  close() {
    this.dialogRef.close();
    this.router.navigate(['/guide/list']);
  }
}