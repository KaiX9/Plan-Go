import { AfterViewInit, Component, ElementRef, Input, NgZone, ViewChild, inject } from '@angular/core';
import { PlaceSearchResult } from '../models/map.models';
import { Router } from '@angular/router';

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

  router = inject(Router)
  autocomplete: google.maps.places.Autocomplete | undefined;
  ngZone = inject(NgZone)

  ngAfterViewInit() {
    this.autocomplete = new google.maps.places.Autocomplete(this.inputField.nativeElement);
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      const result: PlaceSearchResult = {
        address: this.inputField.nativeElement.value,
        name: place?.name,
        location: place?.geometry?.location,
        imageUrl: this.getPhotoUrl(place),
        iconUrl: place?.icon
      }
      console.info(result);
      this.ngZone.run(() => {
        this.router.navigate(['/map', this.inputField.nativeElement.value]);
      });
    });
  }

  getPhotoUrl(place: google.maps.places.PlaceResult | undefined) {
    return place?.photos && place.photos.length > 0 
      ? place.photos[0].getUrl({ maxWidth: 500 })
      : undefined;
  }

}
