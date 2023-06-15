import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class PlaceDetailsService {
    private placeDetailsData = new BehaviorSubject<google.maps.places.PlaceResult | null> (null);
    placeDetails$ = this.placeDetailsData.asObservable();

    setPlaceDetails(placeDetails: google.maps.places.PlaceResult) {
        this.placeDetailsData.next(placeDetails);
    }
}