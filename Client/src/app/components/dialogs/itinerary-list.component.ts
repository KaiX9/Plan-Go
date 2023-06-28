import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-itinerary-list',
  templateUrl: './itinerary-list.component.html',
  styleUrls: ['./itinerary-list.component.css']
})
export class ItineraryListComponent {
  @Input()
  itineraries!: any[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.itineraries = data.itineraries;
  }
}
