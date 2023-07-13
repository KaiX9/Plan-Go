import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

@Injectable()
export class WeatherService {
    http = inject(HttpClient);

    getWeatherByLocation(lat: any, lon: any) {
        return this.http.get(`/get/weather?lat=${lat}&lon=${lon}`);
    }

    searchWeatherByCity(city: string) {
        return this.http.get(`/search/weather?city=${city}`);
    }
}