import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GM_STYLES } from '../gm.styles';
import { filter } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PlaceDetailsService } from '../services/place-details.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  animations: [
    trigger('slideInOut', [
      state('void', style({ transform: 'translateX(-100%)' })),
      transition('void <=> *', animate(250))
    ]),
  ],
})

export class MapComponent implements OnInit {

  map!: google.maps.Map;
  service!: google.maps.places.PlacesService;
  infowindow!: google.maps.InfoWindow;
  nearbyPlaces: google.maps.places.PlaceResult[] = [];
  Math = Math;
  router = inject(Router);
  showContent = true;
  inputLocation!: string;
  activatedRoute = inject(ActivatedRoute);
  placeDetailsSvc = inject(PlaceDetailsService);

  ngOnInit(): void {
    this.inputLocation = this.activatedRoute.snapshot.params[('location')];
    console.info('location: ', this.inputLocation);
    this.initMap();
    this.updateShowContent();
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateShowContent();
      });
  }

  constructor() {}

  updateShowContent() {
    const childRoute = this.activatedRoute.firstChild;
    this.showContent = !(childRoute && childRoute.outlet === 'placeDetails');
  }

  initMap(): void {
    const sydney = new google.maps.LatLng(-33.867, 151.195);

    this.infowindow = new google.maps.InfoWindow();

    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      center: sydney,
      zoom: 10,
      styles: GM_STYLES.mapStyles
    });

    console.info(this.inputLocation);

    const request = {
      query: this.inputLocation,
      fields: ["name", "geometry", "formatted_address", "types"],
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

    const types = ['restaurant']
    // , 'bar', 'tourist_attraction', 
    //   'shopping_mall', 'lodging', 'cafe'];

    for (const type of types) {
      const request = {
        location: location,
        radius: 100,
        type: type
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
              const placeId = results[i].place_id as string;
              const detailsRequest = {
                placeId: placeId,
                fields: [
                  'formatted_address', 
                  'formatted_phone_number', 
                  'name', 
                  'photos', 
                  'place_id', 
                  'reviews', 
                  'website', 
                  'rating', 
                  'user_ratings_total'
                ]
              };
              this.service.getDetails(detailsRequest, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                  console.info(place);
                  if (place?.reviews) {
                    place.reviews.sort((a, b) => b.time - a.time);
                  }
                  this.nearbyPlaces.push(place);
                  console.info('nearby places: ', this.nearbyPlaces);
                }
              });
              this.createCustomMarker(results[i]);
            }
          }
          console.info(results);
        }
      })
    }    
  }

  viewPlaceDetails(location: string, id?: string) {
    if (id) {
      const place = this.nearbyPlaces.find((place) => place.place_id === id);
      if (place) {
        this.placeDetailsSvc.setPlaceDetails(place);
      }
      this.router.navigate(['/map', location, { outlets: {primary: null, 
        placeDetails: ['place_details', id]}}]);
    }
  }

  createCustomMarker(place: google.maps.places.PlaceResult) {
    if (!place.geometry || !place.geometry.location) return;

    const icons: { [key: string]: string } = {
      restaurant: '/assets/icons_type/restaurant.png',
      bar: '/assets/icons_type/drinks.png',
      tourist_attraction: '/assets/icons_type/site.png',
      shopping_mall: '/assets/icons_type/shop.png',
      lodging: '/assets/icons_type/hotel.png',
      cafe: '/assets/icons_type/cafe.png'
    }

    const type = place.types ? place.types[0] : '';
    if (type in icons) {
      const marker = new google.maps.Marker({
        map: this.map,
        position: place.geometry.location,
        icon: {
          url: icons[type],
          scaledSize: new google.maps.Size(24, 24)
        },
        animation: google.maps.Animation.DROP
      });

      const infowindow = new google.maps.InfoWindow({
        content: place.name || "",
        ariaLabel: place.name || "",
      });
  
      marker.addListener("mouseover", () => {
        console.info('custom marker mouseover', place.name, this.map);
        infowindow.open({
          anchor: marker,
          map: this.map,
        });
      });
      marker.addListener("mouseout", () => {
        console.info('custom marker mouseout', place.name, this.map);
        infowindow.close();
      })
    }
  }

  createMarker(place: google.maps.places.PlaceResult) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
    });

    const infowindow = new google.maps.InfoWindow({
      content: place.name || "",
      ariaLabel: place.name || "",
    })

    marker.addListener("click", () => {
      console.info('marker clicked', place.name, this.map);
      infowindow.open({
        anchor: marker,
        map: this.map,
      });
    });
  }

  display : any;
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
}

declare global {
  interface Window {
    initMap: () => void;
  }
}

window.initMap = () => {};