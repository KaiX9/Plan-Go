import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { DatesService } from '../services/dates.service';
import { Subscription } from 'rxjs';
import { CdkDragDrop, CdkDropList, transferArrayItem } from '@angular/cdk/drag-drop';
import { DateWithItems, Place } from '../models/map.models';
import { SavedPlacesService } from '../services/saved-places.service';

@Component({
  selector: 'app-itinerary',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.css']
})
export class ItineraryComponent implements OnInit, OnDestroy, AfterViewInit {
  savedPlacesSvc = inject(SavedPlacesService);
  datesSvc = inject(DatesService);
  datesArray: DateWithItems[] = [];
  startDateSub$!: Subscription;
  endDateSub$!: Subscription;
  datesList!: CdkDropList;

  @ViewChild('bucketList') bucketList!: CdkDropList;

  @ViewChildren(CdkDropList) datesListsArray: QueryList<CdkDropList> = new 
    QueryList<CdkDropList>();

  ngOnInit(): void {
    console.info('ngOnInit called');
    this.startDateSub$ = this.datesSvc.getStartDate().subscribe(
      (startDate) => {
        if (startDate) {
          const endDate = this.datesSvc.endDate.value;
          if (endDate) {
            this.generateDatesArray(startDate, endDate);
          }
        }
      }
    );
    this.endDateSub$ = this.datesSvc.getEndDate().subscribe(
      (endDate) => {
        if (endDate) {
          const startDate = this.datesSvc.startDate.value;
          if (startDate) {
            this.generateDatesArray(startDate, endDate);
          }
        }
      }
    );
  }

  ngAfterViewInit(): void {
      console.info('datesListsArray: ', this.datesListsArray.toArray());
  }

  filteredDatesListsArray(): CdkDropList[] {
    return this.datesListsArray.filter(list => list instanceof CdkDropList && list !== 
      this.datesList);
  }

  getConnectedLists(): string[] {
    const connectedLists = ['bucketList', ...this.filteredDatesListsArray().map(list => list.id)];
    return connectedLists;
  }

  generateDatesArray(startDate: Date, endDate: Date) {
    if (startDate && endDate) {
      this.datesArray = [];
      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        this.datesArray.push({ date: new Date(date), items: [] });
      }
    }
  }

  ngOnDestroy(): void {
    console.info('ngOnDestroy called');
    this.startDateSub$.unsubscribe();
    this.endDateSub$.unsubscribe();
  }

  deletePlace(place_id: string) {
    this.savedPlacesSvc.savedPlaces = this.savedPlacesSvc.savedPlaces.filter(
      (place) => place.place_id !== place_id
    );
  }

  deleteItemFromDatesList(place_id: string, datesListData: any[]) {
    console.info('place_id: ', place_id);
    console.info('datesListData: ', datesListData);
    const index = datesListData.findIndex((item) => item.place_id === place_id);
    if (index !== -1) {
      datesListData.splice(index, 1);
    }
  }

  drop(event: CdkDragDrop<Place[]>) {
    if (event.previousContainer === this.bucketList && event.container !== this.bucketList) {
      const item = event.item.data;
      console.info('Item: ', item);
      this.savedPlacesSvc.savedPlaces = this.savedPlacesSvc.savedPlaces.filter(
        (place) => place.place_id !== item.place_id
      );
      console.info('savedPlaces: ', this.savedPlacesSvc.savedPlaces);
      const datesListData = event.container.data;
      datesListData.push(item);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
}