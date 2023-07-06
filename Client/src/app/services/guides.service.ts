import { Injectable } from "@angular/core";

@Injectable()
export class GuidesService {
    itineraryData: any;
    selectedCity!: string;

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
}