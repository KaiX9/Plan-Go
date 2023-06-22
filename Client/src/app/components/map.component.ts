import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GM_STYLES } from '../gm.styles';
import { filter } from 'rxjs';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { PlaceDetailsService } from '../services/place-details.service';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { DirectionsService } from '../services/directions.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  animations: [
    trigger('slideInOut', [
      state('void', style({ transform: 'translateX(-100%)' })),
      state('*', style({ transform: 'translateX(0)' })),
      transition('void <=> *', animate('300ms ease-in')),
      transition('* => void', animate('300ms ease-out'))
    ]),
  ],
})
export class MapComponent implements OnInit {
  map!: google.maps.Map;
  service!: google.maps.places.PlacesService;
  infowindow!: google.maps.InfoWindow;
  nearbyPlaces: google.maps.places.PlaceResult[] = [];
  filteredPlaces: google.maps.places.PlaceResult[] = [];
  Math = Math;
  router = inject(Router);
  showContent = true;
  inputLocation!: string;
  activatedRoute = inject(ActivatedRoute);
  placeDetailsSvc = inject(PlaceDetailsService);
  markers: google.maps.Marker[] = [];
  appliedFilters: string[] = [];
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsSvc = inject(DirectionsService);
  directionsInstructions: Array<
   | { maneuver: string; instruction: string; distance: string | undefined }
   | { name: string; address: string }
  > = [];
  isToolbarClicked = false;
  distanceMatrixResponse: google.maps.DistanceMatrixResponse | null = null;
  placeNames: string[] = [];

  @ViewChild('group') 
  group!: MatButtonToggleGroup;

  ngOnInit(): void {
    this.inputLocation = this.activatedRoute.snapshot.params['location'];
    console.info('location: ', this.inputLocation);
    this.initMap();
    this.filteredPlaces = this.nearbyPlaces;
    this.updateShowContent();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateShowContent();
      });
    this.directionsSvc.currentRequest.subscribe(request => {
      console.info('request: ', request);
      if (request) {
        this.showDirections(request);
      }
    });
    this.directionsSvc.isToolbarClicked$.subscribe(isClicked => {
      console.info('isToolbarClicked: ', isClicked);
      this.isToolbarClicked = isClicked;
    });
    this.directionsSvc.distanceMatrixRequest$.subscribe((request) => {
      if (request) {
        this.getDistances(request.origins, request.destinations);
      }
    });
    this.directionsSvc.currentPlaceNames.subscribe((placeNames) => {
      this.placeNames = placeNames;
    })
  }

  constructor() {}

  onToggleChange() {
    if (this.group.value.length === 0) {
      this.appliedFilters = [];
    } else {
      this.appliedFilters = this.group.value;
    }
    console.info('filteredPlaces: ', this.filteredPlaces);
  }

  applyFilters() {
    if (this.appliedFilters.length === 0) {
      this.filteredPlaces = this.nearbyPlaces;
    } else {
      this.filteredPlaces = this.nearbyPlaces.filter(place => 
        place.types?.some(type => this.appliedFilters.includes(type))
      );
    }
    this.updateMarkers();
  }

  removeFilters() {
    this.appliedFilters = [];
    this.applyFilters();
    this.group.value = [];
  }

  updateShowContent() {
    const childRoute = this.activatedRoute.firstChild;
    this.showContent = !(childRoute && childRoute.outlet === 'placeDetails');
    console.info('showContent: ', this.showContent);
  }

  showDirections(request: any) {
    this.map = new google.maps.Map(document.getElementById('map')!, {
      zoom: 15,
      center: this.map.getCenter(),
      styles: GM_STYLES.mapStyles,
    });
    this.directionsRenderer.setMap(this.map);

    this.directionsService.route(request, (response, status) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(response);
        const legs = response?.routes[0].legs;
        if (legs) {
          this.directionsInstructions = legs?.flatMap((leg, index) => [
            { name: this.placeNames[index], address: leg.start_address },
            ...leg.steps.map((step) => ({
              maneuver: step.maneuver,
              instruction: step.instructions,
              distance: step.distance?.text,
            })),
            { name: this.placeNames[index + 1], address: leg.end_address },
          ]);
          console.info('directionsInstructions: ', this.directionsInstructions);
          this.directionsSvc.updateDirectionsInstructions(
            this.directionsInstructions ?? []
          );
        }
      }
    });
  }

  getDistances(origins: string[], destinations: string[]) {
    console.info('getDistances origins: ', origins);
    console.info('getDistances destinations: ', destinations);
    const locations = [...origins, ...destinations];
    const distMatrixService = new google.maps.DistanceMatrixService();
    const distancesAndDurations = new Array<{ originName: string; destinationName: string; 
      distance: string; duration: string }>(locations.length - 1);
    let responsesReceived = 0;
    locations.forEach((originName, index) => {
      if (index < locations.length - 1) {
        const destinationName = locations[index + 1];
        distMatrixService.getDistanceMatrix(
          {
            origins: [originName],
            destinations: [destinationName],
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            console.info(`Received response for distance from ${originName} to 
              ${destinationName}`);
            responsesReceived++;
            if (status === 'OK' && response) {
              const element = response.rows[0].elements[0];
              if (element.status === 'OK') {
                const distance = element.distance.text;
                const duration = element.duration.text;
                console.info(`The distance from ${originName} to ${destinationName} is ${distance} and 
                  will take approximately ${duration}.`);
                distancesAndDurations[index] = { originName, destinationName, distance, duration };
              } else {
                console.warn(`Failed to calculate distance from ${originName} to 
                  ${destinationName}: ${element.status}`);
              }
            }
            if (responsesReceived === locations.length - 1) {
              this.directionsSvc.updateDistanceAndDuration(distancesAndDurations);
            }
          }
        );
      }       
    });
  }

  initMap(): void {
    const sydney = new google.maps.LatLng(-33.867, 151.195);

    this.infowindow = new google.maps.InfoWindow();

    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: sydney,
        zoom: 10,
        styles: GM_STYLES.mapStyles,
      }
    );

    console.info(this.inputLocation);

    const request = {
      query: this.inputLocation,
      fields: ['name', 'geometry', 'formatted_address', 'types'],
    };

    this.service = new google.maps.places.PlacesService(this.map);

    this.service.findPlaceFromQuery(
      request,
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          for (let i = 0; i < results.length; i++) {
            this.createMarker(results[i]);
          }

          this.map.setCenter(results[0].geometry!.location!);
          console.info(results);
          this.searchNearbyPlaces(results[0].geometry!.location!);
        }
      }
    );
  }

  searchNearbyPlaces(location: google.maps.LatLng) {
    const types = ['restaurant', 'bar', 'tourist_attraction', 'shopping_mall', 'lodging', 'cafe'];
    let requestsMade = 0;
    let responsesReceived = 0;

    for (const type of types) {
      const request = {
        location: location,
        radius: 50,
        type: type,
      };

      this.service.nearbySearch(
        request,
        (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus
        ) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            for (let i = 0; i < Math.min(2, results.length); i++) {
              if (results[i].place_id) {
                requestsMade++;
                const placeId = results[i].place_id as string;
                const detailsRequest = {
                  placeId: placeId,
                  fields: [
                    'geometry',
                    'formatted_address',
                    'formatted_phone_number',
                    'name',
                    'photos',
                    'place_id',
                    'reviews',
                    'types',
                    'website',
                    'rating',
                    'user_ratings_total',
                  ],
                };
                this.service.getDetails(detailsRequest, (place, status) => {
                  responsesReceived++;
                  if (
                    status === google.maps.places.PlacesServiceStatus.OK &&
                    place
                  ) {
                    console.info(place);
                    if (place?.reviews) {
                      place.reviews.sort((a, b) => b.time - a.time);
                    }
                    if (!this.nearbyPlaces.some(p => p.place_id === place.place_id)) {
                      this.nearbyPlaces.push(place);
                      console.info('nearby places: ', this.nearbyPlaces);
                    }
                  }
                  if (responsesReceived === requestsMade) {
                      this.onToggleChange();
                  }
                });
                this.createCustomMarker(results[i]);
              }
            }
            console.info(results);
          }
        }
      );
    }
  }

  viewPlaceDetails(location: string, id?: string) {
    if (id) {
      const place = this.nearbyPlaces.find((place) => place.place_id === id);
      if (place) {
        this.placeDetailsSvc.setPlaceDetails(place);
      }
      this.router.navigate([
        '/map',
        location,
        { outlets: { primary: null, placeDetails: ['place_details', id] } },
      ]);
    }
  }

  createCustomMarker(place: google.maps.places.PlaceResult): google.maps.Marker | undefined {
      console.info('createCustomMarker called with place: ', place);
      if (!place.geometry || !place.geometry.location) return undefined;
  
      const icons: { [key: string]: string } = {
        restaurant: '/assets/icons_type/restaurant.png',
        bar: '/assets/icons_type/drinks.png',
        tourist_attraction: '/assets/icons_type/site.png',
        shopping_mall: '/assets/icons_type/shop.png',
        lodging: '/assets/icons_type/hotel.png',
        cafe: '/assets/icons_type/cafe.png',
      };
  
      const matchingType = place.types?.find(type => icons.hasOwnProperty(type));
      if (!matchingType) return undefined;
      const iconUrl = icons[matchingType];
      const marker = new google.maps.Marker({
        map: this.map,
        position: place.geometry.location,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(24, 24),
        },
        animation: google.maps.Animation.DROP,
        });
  
        marker.addListener('mouseover', () => {
          console.info('custom marker mouseover', place.name, this.map);
          this.infowindow.setContent(place.name || '');
          this.infowindow.open({
            anchor: marker,
            map: this.map,
          });
        });
        marker.addListener('mouseout', () => {
          console.info('custom marker mouseout', place.name, this.map);
          this.infowindow.close();
        });
        return marker;
    }

  updateMarkers() {
    console.info('updateMarkers called');
    const newMap = new google.maps.Map(document.getElementById('map')!, {
      zoom: 15,
      center: this.map.getCenter(),
      styles: GM_STYLES.mapStyles,
    });
    const icons: { [key: string]: string } = {
      restaurant: '/assets/icons_type/restaurant.png',
      bar: '/assets/icons_type/drinks.png',
      tourist_attraction: '/assets/icons_type/site.png',
      shopping_mall: '/assets/icons_type/shop.png',
      lodging: '/assets/icons_type/hotel.png',
      cafe: '/assets/icons_type/cafe.png',
    };

    const newMarkers: google.maps.Marker[] = [];
  
    this.filteredPlaces.forEach(place => {
      console.info('Place: ', place);
      console.info('place_id: ', place.place_id);
      if (!place.geometry) return;
      const matchingType = place.types?.find(type => icons.hasOwnProperty(type));
      if (!matchingType) return;
      const iconUrl = icons[matchingType];
      const marker = new google.maps.Marker({
        map: newMap,
        position: place.geometry.location!,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(24, 24),
        },
        animation: google.maps.Animation.DROP,
      });
  
      marker.addListener('mouseover', () => {
        console.info('custom marker mouseover', place.name, newMap);
        this.infowindow.setContent(place.name || '');
        this.infowindow.open({
          anchor: marker,
          map: newMap,
        });
      });
      marker.addListener('mouseout', () => {
        console.info('custom marker mouseout', place.name, newMap);
        this.infowindow.close();
      });
      newMarkers.push(marker);
    });
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = newMarkers;
    this.map = newMap;
    console.info('markers array: ', this.markers);
  }

  createMarker(place: google.maps.places.PlaceResult) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
    });

    const infowindow = new google.maps.InfoWindow({
      content: place.name || '',
      ariaLabel: place.name || '',
    });

    marker.addListener('click', () => {
      console.info('marker clicked', place.name, this.map);
      infowindow.open({
        anchor: marker,
        map: this.map,
      });
    });
  }

  display: any;
  center: google.maps.LatLngLiteral = { lat: 24, lng: 12 };
  zoom = 4;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];
}

declare global {
  interface Window {
    initMap: () => void;
  }
}

window.initMap = () => {};