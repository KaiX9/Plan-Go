import { Component, OnInit, inject } from '@angular/core';
import { PlaceDetailsService } from '../services/place-details.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { SavedPlacesService } from '../services/saved-places.service';

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.component.html',
  styleUrls: ['./place-details.component.css']
})
export class PlaceDetailsComponent implements OnInit {

  placeDetailsSvc = inject(PlaceDetailsService);
  placeDetails$!: Observable<google.maps.places.PlaceResult | null>;
  Math = Math;
  location = inject(Location);
  savedPlacesSvc = inject(SavedPlacesService);
  unsubscribe$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    console.info('PlaceDetailsComponent instantiated');
    this.placeDetails$ = this.placeDetailsSvc.placeDetails$;
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    const authorName = target.getAttribute('alt');
    target.src = this.getDefaultProfilePicture(authorName);
  }

  getDefaultProfilePicture(authorName: string | null): string {
    if (authorName) {
      const initials = this.getInitials(authorName);
      const svg = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#ccc" />
          <text x="50" y="60" text-anchor="middle" font-size="40">${initials}</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } else {
      const svg = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#ccc" />
          <text x="50" y="60" text-anchor="middle" font-size="40">?</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
  }

  getInitials(authorName: string): string {
    return authorName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }

  goBack() {
    this.location.back();
  }

  savePlace(place_id: string, name: string) {
    this.placeDetails$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(placeDetails => {
        if (placeDetails) {
          this.savedPlacesSvc.savePlace(place_id, name, placeDetails.types || []);
          this.unsubscribe$.next();
      }
    });
  }
}