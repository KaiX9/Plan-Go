import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { GuideData } from "../models/guides.models";
import { Observable } from "rxjs";

const URL_SAVE_GUIDE = '/save/guide';
const URL_WRITE_GUIDE_LIST = '/writeguidelist';
const URL_GET_ALL_GUIDES = '/get/guides';
const URL_GET_USER_GUIDES = '/user/guides';

@Injectable()
export class GuidesService {
    itineraryData: any;
    selectedCity!: string;
    http = inject(HttpClient);
    selectedUuid!: string;
    selectedGuide!: any;
    authorName!: string;

    setItineraryData(data: any, city: string) {
        this.itineraryData = data;
        this.selectedCity = city;
    }

    getItineraryData() {
        return this.itineraryData;
    }

    getSelectedCity() {
        return this.selectedCity;
    }

    setSelectedUuid(uuid: string) {
        this.selectedUuid = uuid;
    }
    
    getSelectedUuid() {
        return this.selectedUuid;
    }

    setSelectedGuide(guide: any) {
        this.selectedGuide = guide;
    }

    getSelectedGuide() {
        return this.selectedGuide;
    }
    
    setAuthorName(name: string) {
        this.authorName = name;
    }

    getAuthorName() {
        return this.authorName;
    }

    getWriteGuideList(): Observable<any> {
        return this.http.get<any>(URL_WRITE_GUIDE_LIST);
    }

    saveGuide(data: GuideData): Observable<any> {
        return this.http.post<any>(URL_SAVE_GUIDE, data);
    }

    getAllGuides(): Observable<any> {
        return this.http.get<any>(URL_GET_ALL_GUIDES);
    }

    getGuidesForUser(): Observable<any> {
        return this.http.get<any>(URL_GET_USER_GUIDES);
    }
}