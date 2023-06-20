import { AfterViewInit, Component, ElementRef, Input, NgZone, ViewChild, inject } from '@angular/core';
import { PlaceSearchResult } from '../models/map.models';
import { Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatesService } from '../services/dates.service';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent implements AfterViewInit {
  @ViewChild('inputField')
  inputField!: ElementRef;

  @Input()
  placeholder = '';

  router = inject(Router);
  autocomplete: google.maps.places.Autocomplete | undefined;
  ngZone = inject(NgZone);
  minEndDate: Date | null = null;
  minStartDate = new Date();
  result: PlaceSearchResult | undefined;
  datesSvc = inject(DatesService);

  ngAfterViewInit() {
    this.autocomplete = new google.maps.places.Autocomplete(this.inputField.nativeElement);
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      this.result = {
        address: this.inputField.nativeElement.value,
        name: place?.name,
        location: place?.geometry?.location,
        imageUrl: this.getPhotoUrl(place),
        iconUrl: place?.icon
      }
      console.info(this.result);
    });
  }

  getPhotoUrl(place: google.maps.places.PlaceResult | undefined) {
    return place?.photos && place.photos.length > 0 
      ? place.photos[0].getUrl({ maxWidth: 500 })
      : undefined;
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>){
    this.minEndDate = event.value;
    if (event.value) {
      this.datesSvc.setStartDate(event.value);
    }
  }

  onEndDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.datesSvc.setEndDate(event.value);
    }
  }

  onStartExploring() {
    if (this.result) {
      this.ngZone.run(() => {
        this.router.navigate(['/map', this.result?.address]);
      });
    }
  }
}