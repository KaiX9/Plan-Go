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
import { ItineraryListComponent } from './dialogs/itinerary-list.component';
import { CalendarDialogComponent } from './dialogs/calendar-dialog.component';
import { SavedDialogComponent } from './dialogs/saved-dialog.component';

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
  clickedDate!: string | null;
  isToolbarClicked = false;
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  isExpanded: boolean[][] = [];
  comments: { place_id: string, comment: string }[] = [];
  dialog = inject(MatDialog);
  mergedArray: Merged[] = [];
  saveItinerarySvc = inject(SaveItineraryService);
  uuid: string | undefined;

  @ViewChild('bucketList') bucketList!: CdkDropList;

  @ViewChildren(CdkDropList) datesListsArray: QueryList<CdkDropList> = new 
    QueryList<CdkDropList>();

  ngOnInit(): void {
    if (this.saveItinerarySvc.itineraryDetails && this.saveItinerarySvc.itineraryDetails.length > 0) {
      if (this.saveItinerarySvc.startDate) {
        var startDateString = this.saveItinerarySvc.startDate;
        var startTimestamp = Date.parse(startDateString);
        this.startDate = new Date(startTimestamp);
        console.info('start date: ', this.startDate);
      }
      if (this.saveItinerarySvc.endDate) {
        var endDateString = this.saveItinerarySvc.endDate;
        var endTimestamp = Date.parse(endDateString);
        this.endDate = new Date(endTimestamp);
        console.info('end date: ', this.endDate);
      }
      this.uuid = this.saveItinerarySvc.uuid;
      const itineraryDetails = this.saveItinerarySvc.itineraryDetails;
      console.info('itineraryDetails: ', itineraryDetails);
      this.generateSavedDatesArray(this.startDate, this.endDate, itineraryDetails);
    } else {
      const startDateString = localStorage.getItem('startDate');
      const endDateString = localStorage.getItem('endDate');
      if (startDateString && endDateString) {
        this.startDate = new Date(startDateString);
        this.endDate = new Date(endDateString);
        this.generateDatesArray(this.startDate, this.endDate);
      } else {
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
    }
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

  generateSavedDatesArray(startDate: Date, endDate: Date, itineraryDetails: any[]) {
    if (startDate && endDate) {
      this.datesArray = [];
      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        let items = itineraryDetails
          .filter(detail => detail.date === date.toISOString().slice(0,10))
          .map(detail => ({
            place_id: detail.placeId, 
            name: detail.name, 
            comment: detail.comment,
            types: detail.types
          }));
        this.datesArray.push({ date: new Date(date), items: items });
      }
    }
  }

  ngOnDestroy(): void {
    console.info('ngOnDestroy called');
    if (this.startDateSub$){
      this.startDateSub$.unsubscribe();
    }
    if (this.endDateSub$) {
      this.endDateSub$.unsubscribe();
    }
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
    const dateWithItems = this.datesArray.find(dateWithItems => dateWithItems.items 
      === datesListData);
    if (dateWithItems && this.clickedDate === dateWithItems.date.toISOString()) {
      this.showDirections(dateWithItems.items, dateWithItems.date);
    }
  }

  addItemToDatesList(place_id: string, datesListData: any[]) {
    const index = datesListData.findIndex((item) => item.place_id === place_id);
    if (index !== -1) {
      datesListData.push(datesListData[index]);
    }
    console.info('datesListData: ', datesListData);
    console.info('datesArray: ', this.datesArray);
    const dateWithItems = this.datesArray.find(dateWithItems => dateWithItems.items 
      === datesListData);
    if (dateWithItems && this.clickedDate === dateWithItems.date.toISOString()) {
      this.showDirections(dateWithItems.items, dateWithItems.date);
    }
  }

  drop(event: CdkDragDrop<Place[]>) {
    if (event.previousContainer === this.bucketList && event.container !== this.bucketList) {
      const item = event.item.data;
      console.info('Dragged Item: ', item);
      console.info('Bucket list before removing item: ', this.savedPlacesSvc.savedPlaces);
      this.savedPlacesSvc.savedPlaces = this.savedPlacesSvc.savedPlaces.filter(
        (place) => place.place_id !== item.place_id
      );
      console.info('Bucket list after removing item: ', this.savedPlacesSvc.savedPlaces);
      const datesListData = event.container.data;
      datesListData.push(item);
      const dateWithItems = this.datesArray.find(dateWithItems => dateWithItems.items 
        === datesListData);
      if (dateWithItems && this.clickedDate === dateWithItems.date.toISOString()) {
        this.showDirections(dateWithItems.items, dateWithItems.date);
      }
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
    const prevDatesListData = event.previousContainer.data;
    const prevDateWithItems = this.datesArray.find(dateWithItems => dateWithItems.items 
      === prevDatesListData);
    if (prevDateWithItems && this.clickedDate === prevDateWithItems.date.toISOString()) {
      this.showDirections(prevDateWithItems.items, prevDateWithItems.date);
    }
    const currDatesListData = event.container.data;
    const currDateWithItems = this.datesArray.find(dateWithItems => dateWithItems.items 
      === currDatesListData);
    if (currDateWithItems && this.clickedDate === currDateWithItems.date.toISOString()) {
      this.showDirections(currDateWithItems.items, currDateWithItems.date);
    }
  }

  toggleDirections(items: any[], date: Date) {
    if (this.clickedDate === date.toISOString()) {
      this.clickedDate = null;
      this.directionsSvc.updateIsToolbarClicked(false);
      this.isToolbarClicked = false;
    } else {
      this.showDirections(items, date);
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
      const origins = [items[0].place_id];
      const destinations = items.slice(1).map((item) => item.place_id);
      this.directionsSvc.updateDistanceMatrixRequest({ origins, destinations });
    }
  }

  openNotesDialog(place_id: string) {
    let comment: any;
    comment = this.comments.find(c => c.place_id === place_id);
    if (!comment && this.saveItinerarySvc.itineraryDetails && 
      this.saveItinerarySvc.itineraryDetails.length > 0) {
      comment = this.saveItinerarySvc.itineraryDetails.find(detail => detail.placeId === place_id);
    }
    console.info('comment: ', comment);
    const currentNotes = comment ? comment.comment : '';
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = '350px';
    dialogConfig.data = { notes: currentNotes };
    const dialogRef = this.dialog.open(NotesDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(notes => {
      console.info('notes: ', notes);
      const existingComment = this.comments.find(c => c.place_id === place_id);
      if (existingComment) {
        existingComment.comment = notes;
      } else {
        this.comments.push({ place_id, comment: notes });
      }
      console.info('comments: ', this.comments);
    });
  }

  savePlan() {
    console.info('datesArray: ', this.datesArray);
    console.info('comments ', this.comments);
    this.mergedArray = this.datesArray.map(date => ({
      ...date, 
      items: date.items.map(item => ({
        ...item, 
        comment: this.comments.find(c => c.place_id === item.place_id)?.comment || '',
        types: item.types
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
      endDate: this.endDate,
      uuid: this.uuid
    }

    const calDialogConfig = new MatDialogConfig();
    calDialogConfig.width = '400px';
    calDialogConfig.height = '220px';
    calDialogConfig.data = { message: 'Do you want to save this itinerary to your Google Calendar?' };
    let dialogRef = this.dialog.open(CalendarDialogComponent, calDialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.saveItinerarySvc.saveItinerary(this.mergedArray, list).subscribe(response => {
          console.info('resp: ', response);
          this.authorize(list);
        });
      } else {
        this.saveItinerarySvc.saveItinerary(this.mergedArray, list).subscribe(response => {
          console.info('resp: ', response);
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '300px';
          dialogConfig.height = '150px';
          let savedDialogRef = this.dialog.open(SavedDialogComponent, dialogConfig);
          savedDialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/autocomplete']);
          });
        });
      }
    });
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

  authorize = (list: ItiList) => {
    const clientId = '40217998435-iumv53hsu529dfcmcjbe25gopo9j0d31.apps.googleusercontent.com';
    // const redirectUri = 'http://localhost:8080/save/calendar';
    const redirectUri = 'https://planandgo-production.up.railway.app/save/calendar';
    const scope = 'https://www.googleapis.com/auth/calendar';
    const state = JSON.stringify({
      location: list.location,
      startDate: list.startDate,
      endDate: list.endDate,
      uuid: list.uuid
    });  
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `include_granted_scopes=true&` +
      `response_type=code&` +
      `state=${encodeURIComponent(state)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `client_id=${encodeURIComponent(clientId)}`;
  
    window.location.href = url;
  }

  getIconColor(place: any): string {
    const colors: { [key: string]: string } = {
      restaurant: 'orange',
      bar: 'yellow',
      tourist_attraction: 'lightcoral',
      shopping_mall: 'purple',
      lodging: 'blue',
      cafe: 'lightgreen',
    };
    const matchingType = place.types?.find((type: any) => colors.hasOwnProperty(type));
    if (!matchingType) return '';

    const color = colors[matchingType];
    return color;
  }

  getIconText(place: any): string {
    const icons: { [key: string]: string } = {
      restaurant: 'restaurant',
      bar: 'local_bar',
      tourist_attraction: 'photo_camera',
      shopping_mall: 'shopping_bag',
      lodging: 'bed',
      cafe: 'local_cafe',
    };
  
    const matchingType = place.types?.find((type: any) => icons.hasOwnProperty(type));
    if (!matchingType) return '';
  
    const icon = icons[matchingType];
    return icon;
  }
}