import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ItiList, Merged } from "../models/save.models";
import { Observable, tap } from "rxjs";

const URL_SAVE = '/save';
const URL_ITI_LIST = '/get/list';
const URL_FULL_ITI = '/full/iti'

@Injectable()
export class SaveItineraryService {

    uuid?: string;
    city?: string;
    startDate?: string;
    endDate?: string;
    itineraryDetails?: any[];

    http = inject(HttpClient);

    saveItinerary(details: Merged[], list: ItiList): Observable<any> {
        const payload = {
            details,
            list
        };
        return this.http.post<any>(URL_SAVE, payload);
    }

    getItineraryList(): Observable<any> {
        return this.http.get<any>(URL_ITI_LIST);
    }

    getFullItinerary(uuid: string): Observable<any> {
        const params = new HttpParams().set('uuid', uuid);
        return this.http.get<any>(URL_FULL_ITI, { params }).pipe(
            tap(response => console.info('getFullItinerary response: ', response))
        );
    }
}