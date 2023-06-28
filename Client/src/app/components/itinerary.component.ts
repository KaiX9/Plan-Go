import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { DatesService } from '../services/dates.service';
import { Subscription } from 'rxjs';
import { CdkDragDrop, CdkDropList, transferArrayItem } from '@angular/cdk/drag-drop';
import { DateWithItems, Place } from '../models/map.models';
import { SavedPlacesService } from '../services/saved-places.service';
import { DirectionsService } from '../services/directions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NotesDialogComponent } from './dialogs/notes-dialog.component';
import { SaveItineraryService } from '../services/save-itinerary.service';
import { ItiList, Merged } from '../models/save.models';
import { SavedDialogComponent } from './dialogs/saved-dialog.component';
import { ItineraryListComponent } from './dialogs/itinerary-list.component';

@Component({
  selector: 'app-itinerary',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.css']
})
export class ItineraryComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  savedPlacesSvc = inject(SavedPlacesService);
  datesSvc = inject(DatesService);
  datesArray: DateWithItems[] = [];
  startDateSub$!: Subscription;
  endDateSub$!: Subscription;
  startDate!: Date;
  endDate!: Date;
  datesList!: CdkDropList;
  changeDetector = inject(ChangeDetectorRef);
  directionsSvc = inject(DirectionsService);
  clickedDate!: string;
  isToolbarClicked = false;
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  isExpanded: boolean[][] = [];
  comments: { place_id: string, comment: string }[] = [];
  dialog = inject(MatDialog);
  mergedArray: Merged[] = [];
  saveItinerarySvc = inject(SaveItineraryService);
  uuid: string = '';

  @ViewChild('bucketList') bucketList!: CdkDropList;

  @ViewChildren(CdkDropList) datesListsArray: QueryList<CdkDropList> = new 
    QueryList<CdkDropList>();

  ngOnInit(): void {
    console.info('ngOnInit called');
    this.startDateSub$ = this.datesSvc.getStartDate().subscribe(
      (startDate) => {
        if (startDate) {
          this.startDate = startDate;
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
          this.endDate = endDate;
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

  ngAfterViewChecked(): void {
    this.changeDetector.detectChanges();
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
    const index = datesListData.findIndex((item) => item.place_id === place_id);
    if (index !== -1) {
      datesListData.splice(index, 1);
    }
    console.info('datesListData: ', datesListData);
    console.info('datesArray: ', this.datesArray);
  }

  addItemToDatesList(place_id: string, datesListData: any[]) {
    const index = datesListData.findIndex((item) => item.place_id === place_id);
    if (index !== -1) {
      datesListData.push(datesListData[index]);
    }
    console.info('datesListData: ', datesListData);
    console.info('datesArray: ', this.datesArray);
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

  showDirections(items: any[], date: Date) {
    console.info('showDirections items: ', items);
    const placeNames = items.map((item) => item.name);
    this.directionsSvc.updatePlaceNames(placeNames);
    this.directionsSvc.updateIsToolbarClicked(true);
    this.isToolbarClicked = true;
    this.clickedDate = date.toISOString();
    if (items.length > 1) {
      const request = {
        origin: { placeId: items[0].place_id },
        destination: { placeId: items[items.length - 1].place_id },
        waypoints: items.slice(1, -1).map(item => ({ location: { placeId: item.place_id } 
      })),
        travelMode: 'DRIVING',
        optimizeWaypoints: true
      };
      this.directionsSvc.changeRequest(request);
      const origins = [items[0].name];
      const destinations = items.slice(1).map((item) => item.name);
      this.directionsSvc.updateDistanceMatrixRequest({ origins, destinations });
    }
  }

  openNotesDialog(place_id: string) {
    const comment = this.comments.find(c => c.place_id === place_id);
    const currentNotes = comment ? comment.comment : '';
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = '350px';
    dialogConfig.data = { notes: currentNotes };
    const dialogRef = this.dialog.open(NotesDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(notes => {
      if (comment) {
        comment.comment = notes;
      } else {
        this.comments.push({ place_id, comment: notes });
      }
    });
  }

  savePlan() {
    console.info('datesArray: ', this.datesArray);
    console.info('comments ', this.comments);
    this.mergedArray = this.datesArray.map(date => ({
      ...date, 
      items: date.items.map(item => ({
        ...item, 
        comment: this.comments.find(c => c.place_id === item.place_id)?.comment || ''
      }))
    }));
    console.info('mergedArray: ', this.mergedArray);
    const location = this.activatedRoute.snapshot.params['location'];
    console.info('location: ', location);
    console.info('start date: ', this.startDate);
    console.info('end date: ', this.endDate);
    const list: ItiList = {
      location: location,
      startDate: this.startDate,
      endDate: this.endDate
    }
    this.saveItinerarySvc.saveItinerary(this.mergedArray, list).subscribe(
      response => {
        console.info('resp: ', response);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '300px';
        dialogConfig.height = '150px';
        this.dialog.open(SavedDialogComponent, dialogConfig);
      }
    );
  }

  getItiList() {
    this.saveItinerarySvc.getItineraryList().subscribe(
      response => {
        console.info('list: ', response);
        this.dialog.open(ItineraryListComponent, {
          data: { itineraries: response }
        });
      }
    );
  }
}