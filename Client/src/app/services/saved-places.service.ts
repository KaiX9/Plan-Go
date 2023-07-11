import { Injectable } from '@angular/core';
import { Place, PlaceWithTypes } from '../models/map.models';

@Injectable()
export class SavedPlacesService {
  savedPlaces: Place[] = [];

  savePlace(place_id: string, name: string, types: string[]) {
    const isDuplicate = this.savedPlaces.some(
      (place) => place.place_id === place_id
    );
    if (!isDuplicate) {
      const place: PlaceWithTypes = { place_id: place_id, name: name, types: types };
      this.savedPlaces.push(place);
    }
  }
}