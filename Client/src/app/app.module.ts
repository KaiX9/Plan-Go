import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { LoginService } from './services/login.service';
import { DashboardComponent } from './components/dashboard.component';
import { WithCredentialsInterceptor } from 'src/app/with.credentials.interceptor';
import { MapComponent } from './components/map.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AutocompleteComponent } from './components/autocomplete.component';
import { MaterialModule } from './material.module';
import { PlaceDetailsComponent } from './components/place-details.component';
import { PlaceDetailsService } from './services/place-details.service';
import { ItineraryComponent } from './components/itinerary.component';
import { SavedPlacesService } from './services/saved-places.service';
import { DatesService } from './services/dates.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DirectionsService } from './services/directions.service';
import { DirectionsInstructionsComponent } from './components/directions-instructions.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NotesDialogComponent } from './components/dialogs/notes-dialog.component';
import { SaveItineraryService } from './services/save-itinerary.service';
import { SavedDialogComponent } from './components/dialogs/saved-dialog.component';
import { ItineraryListComponent } from './components/dialogs/itinerary-list.component';
import { AuthenticateErrorComponent } from './components/dialogs/authenticate-error.component';
import { GuideComponent } from './components/guide.component';
import { GuideEditingComponent } from './components/guide-editing.component';
import { GuidesService } from './services/guides.service';
import { GuideListComponent } from './components/guide-list.component';
import { SavedGuideComponent } from './components/dialogs/saved-guide.component';
import { FullGuideComponent } from './components/full-guide.component';
import { UserGuidesComponent } from './components/user-guides.component';
import { OverlappedDatesComponent } from './components/dialogs/overlapped-dates.component';
import { WeatherService } from './services/weather.service';
import { RoundPipe } from './round.pipe';
import { TimePipe } from './time.pipe';
import { NgxSpinnerModule } from 'ngx-spinner';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'map/:location',
    component: MapComponent,
    children: [
      {
        path: 'place_details/:placeId',
        component: PlaceDetailsComponent,
        outlet: 'placeDetails',
      },
      {
        path: 'direct/instructions',
        component: DirectionsInstructionsComponent,
        outlet: 'directionsInstructions',
      },
    ],
  },
  { path: 'guide', component: GuideComponent },
  { path: 'guide/edit', component: GuideEditingComponent },
  { path: 'autocomplete', component: AutocompleteComponent },
  { path: 'guide/list', component: GuideListComponent },
  { path: 'guide/:uuid', component: FullGuideComponent },
  { path: 'user/guides', component: UserGuidesComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    MapComponent,
    AutocompleteComponent,
    PlaceDetailsComponent,
    ItineraryComponent,
    DirectionsInstructionsComponent,
    NotesDialogComponent,
    SavedDialogComponent,
    ItineraryListComponent,
    AuthenticateErrorComponent,
    GuideComponent,
    GuideEditingComponent,
    GuideListComponent,
    SavedGuideComponent,
    FullGuideComponent,
    UserGuidesComponent,
    OverlappedDatesComponent,
    RoundPipe,
    TimePipe,
  ],
  imports: [
    BrowserModule, 
    ReactiveFormsModule,
    HttpClientModule,
    GoogleMapsModule,
    MaterialModule,
    RouterModule.forRoot(routes, { useHash: true }),
    BrowserAnimationsModule,
    NgxSpinnerModule,
    DragDropModule,
    MatDialogModule
  ],
  providers: [
    LoginService,
    PlaceDetailsService,
    SavedPlacesService,
    DatesService,
    DirectionsService,
    SaveItineraryService,
    GuidesService,
    WeatherService,
    { provide: HTTP_INTERCEPTORS, useClass: WithCredentialsInterceptor, multi:true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }