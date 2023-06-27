import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Merged } from "../models/save.models";
import { Observable } from "rxjs";

const URL_SAVE = '/save';

@Injectable()
export class SaveItineraryService {
    http = inject(HttpClient);

    saveItinerary(details: Merged[]): Observable<any> {
        console.info('details from mergedArray: ', details);
        return this.http.post<any>(URL_SAVE, details);
    }
}