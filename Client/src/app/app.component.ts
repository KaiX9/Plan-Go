import { Component, OnInit, inject } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{  
  router = inject(Router);

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: Event) => {
        const navigationEndEvent = event as NavigationEnd;
        const bannerElement = document.querySelector('.banner') as HTMLElement;
        const logoElement = document.querySelector('.logo') as HTMLElement;
        const navbarLinks = document.querySelectorAll('.navbar ul li a') as 
          NodeListOf<HTMLAnchorElement>;
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
            })
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
            })
          }
        }
      })
  }

  clickLogo() {
    this.router.navigate(['/']).then(() => {
      location.reload();
    });
  }

  clickHome() {
    this.router.navigate(['/']);
  }

  toDashboard() {
    this.router.navigate(['/dashboard']);
  }

  toAutocomplete() {
    this.router.navigate(['/autocomplete']);
  }
}