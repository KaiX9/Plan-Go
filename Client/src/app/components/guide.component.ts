import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { SaveItineraryService } from '../services/save-itinerary.service';
import { Observable, Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { GuidesService } from '../services/guides.service';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements OnInit, OnDestroy {
  saveItinerarySvc = inject(SaveItineraryService);
  itineraryList$!: Observable<any[]>;
  selectedItineraryUuid!: string;
  selectedCity!: string;
  fullItinerary$!: Subscription;
  router = inject(Router);
  guidesSvc = inject(GuidesService);

  ngOnInit(): void {
    this.itineraryList$ = this.saveItinerarySvc.getItineraryList();
  }

  ngOnDestroy(): void {
    if (this.fullItinerary$) {
      this.fullItinerary$.unsubscribe();
    }
  }

  onSelectionChange(event: MatSelectChange) {
    this.selectedItineraryUuid = event.value;
    this.itineraryList$.subscribe(itineraryList => {
      const selectedItinerary = itineraryList.find(
        itinerary => itinerary.uuid === event.value
      );
      if (selectedItinerary) {
        this.selectedCity = selectedItinerary.city;
      }
    });
  }

  onWriting(uuid: string) {
    console.info('uuid: ', uuid);
    this.fullItinerary$ = this.saveItinerarySvc.getFullItinerary(uuid).subscribe(
      response => {
        console.info('response: ', response);
        this.guidesSvc.setItineraryData(response, this.selectedCity);
        this.router.navigate(['/guide/edit']);
      }
    );
  }
}
