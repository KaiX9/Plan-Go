import { AfterViewInit, Component, ElementRef, Input, NgZone, OnInit, ViewChild, inject } from '@angular/core';
import { PlaceSearchResult } from '../../models/map.models';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatesService } from '../../services/dates.service';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login.service';
import { AuthenticateErrorComponent } from '../dialogs/authenticate-error.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SavedDialogComponent } from '../dialogs/saved-dialog.component';
import { SaveItineraryService } from '../../services/save-itinerary.service';
import { OverlappedDatesComponent } from '../dialogs/overlapped-dates.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent implements AfterViewInit, OnInit {
  @ViewChild('inputField')
  inputField!: ElementRef;

  @ViewChild('inviteInput')
  inviteInput!: ElementRef<HTMLInputElement>;

  @Input()
  placeholder = 'example...Paris, London, Barcelona';

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  autocomplete: google.maps.places.Autocomplete | undefined;
  ngZone = inject(NgZone);
  minEndDate: Date | null = null;
  minStartDate = new Date();
  result: PlaceSearchResult | undefined;
  datesSvc = inject(DatesService);
  showInput = false;
  invitees: string[] = [];
  inviteInputValue = '';
  http = inject(HttpClient);
  loginSvc = inject(LoginService);
  dialog = inject(MatDialog);
  saveItinerarySvc = inject(SaveItineraryService);
  spinner = inject(NgxSpinnerService);

  ngOnInit(): void {
    this.openSpinner();
    const showSavedDialog = this.getCookie('showSavedDialog');
    if (showSavedDialog === 'true') {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '300px';
      dialogConfig.height = '150px';
      this.dialog.open(SavedDialogComponent, dialogConfig);
      document.cookie = 'showSavedDialog=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    this.loginSvc.autocomplete().subscribe(
      result => {
        console.info(JSON.stringify(result));
      },
      error => {
        if (error) {
          this.router.navigate(['/']).then(() => {
            const errorMessage = error.error.error;
            this.dialog.open(AuthenticateErrorComponent, {
              data: { message: errorMessage }
            });
          });
        }
      }
    );
    const emailSent = this.getCookie('emailSent');
    if (emailSent === 'true') {
      document.cookie = 'emailSent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      const resultString = localStorage.getItem('result');
      if (resultString) {
        const result = JSON.parse(resultString);
        localStorage.removeItem('result');
        this.ngZone.run(() => {
          this.router.navigate(['/map', result?.address]);
        });
      }
    }
  }

  ngAfterViewInit() {
    this.autocomplete = new google.maps.places.Autocomplete(this.inputField.nativeElement);
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      this.result = {
        address: this.inputField.nativeElement.value,
        name: place?.name,
        location: place?.geometry?.location,
        imageUrl: this.getPhotoUrl(place),
        iconUrl: place?.icon
      }
      console.info(this.result);
    });
  }

  constructor(private titleService: Title) {
    this.activatedRoute.data.subscribe((data) => {
      this.titleService.setTitle(data['title']);
    });
  }

  openSpinner() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return value;
      }
    }
    return null;
  }

  getPhotoUrl(place: google.maps.places.PlaceResult | undefined) {
    return place?.photos && place.photos.length > 0 
      ? place.photos[0].getUrl({ maxWidth: 500 })
      : undefined;
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>){
    this.minEndDate = event.value;
    if (event.value) {
      this.datesSvc.setStartDate(event.value);
      localStorage.setItem('startDate', event.value.toISOString());
    }
  }

  onEndDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.datesSvc.setEndDate(event.value);
      localStorage.setItem('endDate', event.value.toISOString());
    }
  }

  onInput(value: string) {
    this.inviteInputValue = value;
  }

  onOptionSelected(value: string) {
    this.onInvite(value);
  }

  onInvite(value: string) {
    this.invitees.push(value);
    this.inviteInputValue = '';
    this.inviteInput.nativeElement.value = '';
  }

  onRemoveInvitee(index: number) {
    this.invitees.splice(index, 1);
  }

  onStartExploring() {
    const startDateStr = localStorage.getItem('startDate');
    const endDateStr = localStorage.getItem('endDate');
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;
    if (startDate && endDate) {
      this.saveItinerarySvc.getItineraryList().subscribe(response => {
        const hasOverlap = response.some((itinerary: any) => {
          const itineraryStartDate = new Date(itinerary.startDate);
          const itineraryEndDate = new Date(itinerary.endDate);
          return (
            startDate <= itineraryEndDate && endDate >= itineraryStartDate
          );
        });
        if (hasOverlap) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '400px';
          dialogConfig.height = '250px';
          const dialogRef = this.dialog.open(OverlappedDatesComponent, dialogConfig);
          dialogRef.afterClosed().subscribe(result => {
            if (result === 'reselect') {
            } else if (result === 'continue') {
              if (this.invitees.length > 0) {
                localStorage.setItem('result', JSON.stringify(this.result));
                this.authorize();
              } else if (this.result) {
                this.ngZone.run(() => {
                  this.router.navigate(['/map', this.result?.address]);
                });
              }
            }
          });
        } else {
          if (this.invitees.length > 0) {
            localStorage.setItem('result', JSON.stringify(this.result));
            this.authorize();
          } else if (this.result) {
            this.ngZone.run(() => {
              this.router.navigate(['/map', this.result?.address]);
            });
          }
        }
      });
    }
  }

  authorize = () => {
    const clientId = '40217998435-iumv53hsu529dfcmcjbe25gopo9j0d31.apps.googleusercontent.com';
    // const redirectUri = 'http://localhost:8080/invite';
    const redirectUri = 'https://planandgo-production.up.railway.app/invite';
    const scope = 'https://www.googleapis.com/auth/gmail.send';
    const state = JSON.stringify({
      invitees: this.invitees,
      address: this.result?.address,
    });
    console.info('invitees in authorize: ', this.invitees);
  
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
}