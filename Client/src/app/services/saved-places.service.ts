import { Injectable } from '@angular/core';
import { Place } from '../models/map.models';

@Injectable()
export class SavedPlacesService {
  savedPlaces: Place[] = [];

  savePlace(place_id: string, name: string) {
    const isDuplicate = this.savedPlaces.some(
      (place) => place.place_id === place_id
    );
    if (!isDuplicate) {
      this.savedPlaces.push({ place_id: place_id, name: name });
    }
  }
}