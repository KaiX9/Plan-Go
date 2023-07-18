import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticateErrorComponent } from './dialogs/authenticate-error.component';
import { GuidesService } from '../services/guides.service';
import { SaveItineraryService } from '../services/save-itinerary.service';
import { Subscription } from 'rxjs';
import { Review } from '../models/dashboard.models';
import { WeatherService } from '../services/weather.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  loginSvc = inject(LoginService);
  router = inject(Router);
  dialog = inject(MatDialog);
  guidesSvc = inject(GuidesService);
  itineraryImageSources: string[] = [];
  guideImageSources: string[] = [];
  viewCounts: number[] = [];
  selectedGuides: any[] = [];
  selectedItineraries: any[] = [];
  name: string = '';
  saveItinerarySvc = inject(SaveItineraryService);
  sub$!: Subscription;
  isScrolledLeft = true;
  isScrolledRight = false;
  weatherData: any;
  earliestDay: any;
  city!: string;
  weatherSvc = inject(WeatherService);
  selectedDay: any = null;
  spinner = inject(NgxSpinnerService);

  @ViewChild('cityInput')
  cityInput!: ElementRef;
  
  images = [
    '/assets/images/image1.jpg', '/assets/images/image2.jpg',
    '/assets/images/image3.jpg', '/assets/images/image4.jpg',
    '/assets/images/image5.jpg', '/assets/images/image6.jpg',
    '/assets/images/image7.jpg', '/assets/images/image8.jpg',
    '/assets/images/image9.jpg', '/assets/images/image10.jpg',
    '/assets/images/image11.jpg', '/assets/images/image12.jpg',
    '/assets/images/image13.jpg', '/assets/images/image14.jpg',
    '/assets/images/image15.jpg'
  ];

  reviews: Review[] = [
    {
      content:
        'I recently used this travel app to plan my trip to Europe and it was a lifesaver! It helped me organize my itinerary, keep track of my expenses, and collaborate with my friends. I highly recommend it to anyone planning a trip.',
      author: 'John.D',
      rating: 5,
    },
    {
      content:
        'This travel app made planning my road trip so much easier. I was able to map out my route, find the best places to visit, and keep track of all my reservations in one place. It\'s a must-have for any traveler.',
      author: 'Jane.S',
      rating: 5,
    },
    {
      content: 
        'I was blown away by how easy it was to plan my trip using this travel app. The interface is intuitive and the features are incredibly helpful. I especially loved being able to collaborate with my friends and family on our itinerary. Highly recommend!',
      author: 'Amelia.P',
      rating: 5,
    },
    {
      content: 
        'I’ve tried a lot of travel apps, but this one is by far the best. It’s packed with useful features and makes planning a trip a breeze. I love being able to see all my reservations in one place and collaborate with my travel companions. A must-have for any traveler.',
      author: 'Marc.J',
      rating: 5,
    },
    {
      content: 
        'I can’t say enough good things about this travel app. It’s made planning my trips so much easier and more enjoyable. The interface is user-friendly and the features are top-notch. I highly recommend it to anyone planning a trip.',
        author: 'Emily.S',
        rating: 5,
    },
    {
      content: 
        'If you’re looking for a travel app that has it all, look no further. This app has everything you need to plan the perfect trip, from organizing your itinerary to finding the best places to visit. It’s a must-have for any traveler.',
      author: 'Carmen.M',
      rating: 5,
    },
  ];

  ngOnInit(): void {
    this.openSpinner();
    this.loginSvc.dashboard().subscribe(
      result => {
        console.info(JSON.stringify(result));
        if (result.name) {
          localStorage.setItem('name', result.name);
          this.name = result.name;
        }
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

    this.getWeatherData();

    window.addEventListener('scroll', this.onScroll);

    this.saveItinerarySvc.getItineraryList().subscribe(itineraries => {
      let numItineraries = Math.min(4, itineraries.length);
      for (let i = 0; i < numItineraries; i++) {
        const randomIndex = Math.floor(Math.random() * itineraries.length);
        this.selectedItineraries.push(itineraries[randomIndex]);
        itineraries.splice(randomIndex, 1);
      }
      this.itineraryImageSources = [];
      for (const itinerary of this.selectedItineraries) {
        this.itineraryImageSources.push(this.getRandomValue(this.images, 
          this.itineraryImageSources));
      }
    });


    this.guidesSvc.getAllGuides().subscribe(guides => {
      let numGuides = Math.min(4, guides.length);
      for (let i = 0; i < numGuides; i++) {
        const randomIndex = Math.floor(Math.random() * guides.length);
        this.selectedGuides.push(guides[randomIndex]);
        guides.splice(randomIndex, 1);
      }
      this.guideImageSources = [];
      this.viewCounts = [];
      for (const guide of this.selectedGuides) {
        let image = this.getRandomValue(this.images, [...this.guideImageSources, 
          ...this.itineraryImageSources]);
        this.guideImageSources.push(image);
        this.viewCounts.push(Math.floor(Math.random() * (30000 - 100 + 1)) + 100);
      }
    });
  }

  openSpinner() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  onScroll = () => {
    const scrollToTopButton = document.getElementById('scrollToTopButton') as 
      HTMLButtonElement;
    if (scrollToTopButton) {
      if (window.scrollY > 100) {
        scrollToTopButton.style.display = 'block';
      } else {
        scrollToTopButton.style.display = 'none';
      }
    }
  }

  ngOnDestroy(): void {
    if (this.sub$) {
      this.sub$.unsubscribe();
    }

    window.removeEventListener('scroll', this.onScroll);
  }

  getRandomValue(array: any[], exclude: any[] = []) {
    const filteredArray = array.filter(item => !exclude.includes(item));
    return filteredArray[Math.floor(Math.random() * filteredArray.length)];
  }

  onGuideClick(guide: any) {
    console.info('guide clicked: ', guide);
    const authorName = guide.author;
    this.guidesSvc.setAuthorName(authorName);
    this.guidesSvc.setSelectedGuide(guide);
    this.router.navigate(['/guide', guide.uuid]);
  }

  onItineraryClick(uuid: string, city: string, startDate: string, endDate: string) {
    console.info('uuid: ', uuid);
    this.sub$ = this.saveItinerarySvc.getFullItinerary(uuid).subscribe(
      response => {
        console.info('response: ', response);
        this.saveItinerarySvc.uuid = uuid;
        this.saveItinerarySvc.city = city;
        this.saveItinerarySvc.startDate = startDate;
        this.saveItinerarySvc.endDate = endDate;
        this.saveItinerarySvc.itineraryDetails = response;
        const config = this.router.config;
        this.router.resetConfig(config);
        this.router.navigate(['/map', city]);
      }
    );
  }

  scrollReviews(direction: number) {
    const reviewsElement = document.querySelector('.reviews');
    if (reviewsElement) {
      reviewsElement.scrollBy({ left: direction * reviewsElement.clientWidth * 0.7, 
        behavior: 'smooth' });
    }
  }

  onReviewsScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.isScrolledLeft = target.scrollLeft === 0;
    this.isScrolledRight = target.scrollLeft + target.clientWidth === target.scrollWidth;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getWeatherData() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.info('lat: ', lat);
        console.info('lon: ', lon);
        this.weatherSvc.getWeatherByLocation(lat, lon).subscribe(data => {
          this.weatherData = data;
          this.processWeatherData();
          console.info('earliestDay: ', this.earliestDay);
          console.info('weather data: ', this.weatherData);
        });
      });
    } else {
      const lat = 1.3521;
      const lon = 103.8198;
      this.weatherSvc.getWeatherByLocation(lat, lon).subscribe(data => {
        this.weatherData = data;
        this.processWeatherData();
        console.info('earliestDay: ', this.earliestDay);
        console.info('weather data: ', this.weatherData);
      });
    }
  }

  searchWeatherByCity() {
    const city = this.cityInput.nativeElement.value;
    console.info('city: ', city);
    this.cityInput.nativeElement.value = '';
    this.weatherSvc.searchWeatherByCity(city).subscribe(data => {
      this.weatherData = data;
      this.processWeatherData();
      console.info('earliestDay: ', this.earliestDay);
      console.info('weather data: ', this.weatherData);
    });
  }

  getIconPath(icon: string): string {
    const iconMap: { [key: string]: string } = {
      '01d': 'clear_day.svg',
      '01n': 'clear_night.svg',
      '02d': 'partly_cloudy_day.svg',
      '02n': 'partly_cloudy_night.svg',
      '03d': 'cloudy.svg',
      '03n': 'cloudy.svg',
      '04d': 'overcast.svg',
      '04n': 'overcast.svg',
      '09d': 'rain.svg',
      '09n': 'rain.svg',
      '10d': 'partly_cloudy_day_rain.svg',
      '10n': 'partly_cloudy_night_rain.svg',
      '11d': 'thunderstorms_day.svg',
      '11n': 'thunderstorms_night.svg',
      '13d': 'snow.svg',
      '13n': 'snow.svg',
      '50d': 'mist.svg',
      '50n': 'mist.svg',
    };
    const svgFileName = iconMap[icon];
    return `assets/weather_icons/${svgFileName}`;
  }

  processWeatherData() {
    this.weatherData.weatherData.sort((a: any, b: any) => new 
      Date(a.weather_timestamp).getTime() - new Date(b.weather_timestamp).getTime());
    
    this.earliestDay = this.weatherData.weatherData.shift();
    this.earliestDay.city = this.weatherData.city;
    this.earliestDay.description = this.formatDayOfWeek(this.earliestDay.weather_timestamp);
    this.earliestDay.icon = this.earliestDay.weather[0].icon;
    this.earliestDay.sunrise = this.weatherData.sunrise;
    this.earliestDay.sunset = this.weatherData.sunset;

    this.selectedDay = this.earliestDay;

    this.earliestDay.dayOfWeekShort = this.formatDayOfWeekShort(this.earliestDay.weather_timestamp);

    for (let day of this.weatherData.weatherData) {
      day.dayOfWeekShort = this.formatDayOfWeekShort(day.weather_timestamp);
      day.icon = day.weather[0].icon;
      day.description = this.formatDayOfWeek(day.weather_timestamp);
    }
  }

  formatDayOfWeek(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  formatDayOfWeekShort(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  onWeatherClick(event: MouseEvent) {
    event.stopPropagation();
    if (event.currentTarget) {
      const weatherElement = (event.currentTarget as HTMLElement).querySelector('.weather');
      weatherElement?.classList.add('clicked');
      this.selectedDay = this.earliestDay;
      setTimeout(() => {
        weatherElement?.classList.remove('clicked');
      }, 100);
    }
  }

  onOtherDayClick(event: MouseEvent, day: any) {
    event.stopPropagation();
    const otherDayElement = event.currentTarget as HTMLElement;
    otherDayElement.classList.add('clicked');
    this.selectedDay = day;

    setTimeout(() => {
      otherDayElement.classList.remove('clicked');
    }, 100);
  }
}