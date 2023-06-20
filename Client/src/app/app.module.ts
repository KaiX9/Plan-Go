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
        outlet: 'placeDetails'
      },
    ], 
  },
  { path: 'autocomplete', component: AutocompleteComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    MapComponent,
    AutocompleteComponent,
    PlaceDetailsComponent,
    ItineraryComponent
  ],
  imports: [
    BrowserModule, 
    ReactiveFormsModule,
    HttpClientModule,
    GoogleMapsModule,
    MaterialModule,
    RouterModule.forRoot(routes, { useHash: true }),
    BrowserAnimationsModule,
    DragDropModule
  ],
  providers: [
    LoginService,
    PlaceDetailsService,
    SavedPlacesService,
    DatesService,
    { provide: HTTP_INTERCEPTORS, useClass: WithCredentialsInterceptor, multi:true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }