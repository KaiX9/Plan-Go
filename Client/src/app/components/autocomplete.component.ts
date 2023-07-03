import { AfterViewInit, Component, ElementRef, Input, NgZone, OnInit, ViewChild, inject } from '@angular/core';
import { PlaceSearchResult } from '../models/map.models';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatesService } from '../services/dates.service';
import { HttpClient } from '@angular/common/http';

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

  ngOnInit(): void {
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
      console.info('start date: ', event.value);
      this.datesSvc.setStartDate(event.value);
      localStorage.setItem('startDate', event.value.toISOString());
    }
  }

  onEndDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      console.info('end date: ', event.value);
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
    if (this.invitees.length > 0) {
      console.info('invitees: ', this.invitees);
      localStorage.setItem('result', JSON.stringify(this.result));
      this.authorize();
    } else if (this.result) {
      this.ngZone.run(() => {
        this.router.navigate(['/map', this.result?.address]);
      });
    }
  }

  authorize = () => {
    const clientId = '40217998435-iumv53hsu529dfcmcjbe25gopo9j0d31.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:8080/invite';
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