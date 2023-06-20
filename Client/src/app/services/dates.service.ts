import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class DatesService {
    startDate = new BehaviorSubject<Date | null>(null);
    endDate = new BehaviorSubject<Date | null>(null);

    setStartDate(date: Date) {
        this.startDate.next(date);
    }

    getStartDate() {
        return this.startDate.asObservable();
    }

    setEndDate(date: Date) {
        this.endDate.next(date);
    }

    getEndDate() {
        return this.endDate.asObservable();
    }
}