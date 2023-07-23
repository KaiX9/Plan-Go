import { Component, OnInit, inject } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LoginService } from './services/login.service';
import { SaveItineraryService } from './services/save-itinerary.service';
import { MatDialog } from '@angular/material/dialog';
import { ItineraryListComponent } from './components/dialogs/itinerary-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{  
  router = inject(Router);
  loginSvc = inject(LoginService);
  saveItinerarySvc = inject(SaveItineraryService);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    const logoutButton = document.querySelector('.logout-button') as HTMLElement;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: Event) => {
        const navigationEndEvent = event as NavigationEnd;
        const bannerElement = document.querySelector('.banner') as HTMLElement;
        const logoElement = document.querySelector('.logo') as HTMLElement;
        const navbarLinks = document.querySelectorAll('.navbar ul li a') as 
          NodeListOf<HTMLAnchorElement>;
        const dropdownContentElement = document.querySelectorAll('.dropdown-content') as 
          NodeListOf<HTMLAnchorElement>;
        const isLoggedIn = this.isUserLoggedIn();
        if (isLoggedIn) {
          if (logoutButton) {
            logoutButton.style.display = 'block';
          }
        } else {
          if (logoutButton) {
            logoutButton.style.display = 'none';
          }
        }
        if (bannerElement) {
          if (navigationEndEvent.url === '/') {
            bannerElement.style.backgroundImage = 'linear-gradient(rgba(70, 70, 70, 0.4),rgba(70, 70, 70, 0.4))';
            logoElement.style.color = 'white';
            navbarLinks.forEach(link => {
              link.style.color = 'white';
              link.addEventListener('mouseover', () => {
                link.style.background = 'white';
                link.style.transition = '0.5s';
                link.style.color = 'black';
              });
              link.addEventListener('mouseout', () => {
                link.style.background = 'none';
                link.style.transition = '0.5s';
                link.style.color = 'white';
              });
            });
            if (dropdownContentElement) {
              dropdownContentElement.forEach(element => {
                element.style.backgroundColor = 'none';
              });
            }
          } else {
            bannerElement.style.backgroundImage = 'none';
            logoElement.style.color = 'black';
            navbarLinks.forEach(link => {
              link.style.color = 'black';
              link.addEventListener('mouseover', () => {
                link.style.background = 'black';
                link.style.transition = '0.5s';
                link.style.color = 'white';
              });
              link.addEventListener('mouseout', () => {
                link.style.background = 'none';
                link.style.transition = '0.5s';
                link.style.color = 'black';
              });
            });
            if (dropdownContentElement) {
              dropdownContentElement.forEach(element => {
                element.style.backgroundColor = 'white';
              });
            }
          }
        }
      });
  }

  isUserLoggedIn() {
    const allCookies = document.cookie;
    const cookiesArray = allCookies.split('; ');
    const authCookie = cookiesArray.find(cookie => cookie.startsWith('userAuthenticated='));
    return authCookie && authCookie.split('=')[1] === 'true';
  }

  signout() {
    this.loginSvc.signout().subscribe(
      result => {
        console.info(JSON.stringify(result));
        document.cookie = 'userAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
        localStorage.removeItem('name');
        this.router.navigate(['/']).then(() => {
          location.reload();
        });
      }
    );
  }

  clickHome() {
    const isLoggedIn = this.isUserLoggedIn();
    if (isLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']).then(() => {
        location.reload();
      });
    }
  }

  toAutocomplete() {
    this.router.navigate(['/autocomplete']);
  }

  toGuides() {
    this.router.navigate(['/guide']);
  }

  savedItineraries() {
    this.saveItinerarySvc.getItineraryList().subscribe(
      response => {
        console.info('list: ', response);
        this.dialog.open(ItineraryListComponent, {
          data: { itineraries: response }
        });
      }
    );
  }

  viewGuides() {
    this.router.navigate(['/guide/list']);
  }

  myGuides() {
    this.router.navigate(['/user/guides']);
  }

  isFooterVisible() {
    const visibleRoutes = ['dashboard', 'guide', 'autocomplete', 'guide/list', 
      'user/guides'];
    const currentRoute = this.router.url.split('/')[1];
    if (currentRoute === 'guide') {
      const subRoute = this.router.url.split('/')[2];
      return !subRoute || subRoute === 'list';
    } else if (currentRoute === 'user') {
      const subRoute = this.router.url.split('/')[2];
      return subRoute === 'guides';
    }
    return visibleRoutes.includes(currentRoute);
  }
}