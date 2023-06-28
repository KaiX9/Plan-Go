import { Component, Inject, Input, inject, NgZone, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SaveItineraryService } from 'src/app/services/save-itinerary.service';

@Component({
  selector: 'app-itinerary-list',
  templateUrl: './itinerary-list.component.html',
  styleUrls: ['./itinerary-list.component.css']
})
export class ItineraryListComponent implements OnDestroy {
  @Input()
  itineraries!: any[];

  router = inject(Router);
  saveItinerarySvc = inject(SaveItineraryService);
  ngZone = inject(NgZone);
  sub$!: Subscription;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ItineraryListComponent>) {
    this.itineraries = data.itineraries;
  }

  getFullItinerary(uuid: string, city: string, startDate: string, endDate: string) {
    console.info('uuid: ', uuid);
    this.sub$ = this.saveItinerarySvc.getFullItinerary(uuid).subscribe(
      response => {
        console.info('response: ', response);
        this.saveItinerarySvc.city = city;
        this.saveItinerarySvc.startDate = startDate;
        this.saveItinerarySvc.endDate = endDate;
        this.saveItinerarySvc.itineraryDetails = response;
        this.dialogRef.close();
        const config = this.router.config;
        this.router.resetConfig(config);
        this.router.navigate(['/map', city]);
      }
    );
  }

  ngOnDestroy(): void {
      if (this.sub$) {
        this.sub$.unsubscribe();
      }
  }
}
