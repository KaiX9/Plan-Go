import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ItiList, Merged } from "../models/save.models";
import { Observable } from "rxjs";

const URL_SAVE = '/save';

@Injectable()
export class SaveItineraryService {
    http = inject(HttpClient);

    saveItinerary(details: Merged[], list: ItiList): Observable<any> {
        console.info('details from mergedArray: ', details);
        console.info('list: ', list);
        const payload = {
            details,
            list
        };
        return this.http.post<any>(URL_SAVE, payload);
    }
}