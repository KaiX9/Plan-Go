import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { GuidesService } from '../services/guides.service';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticateErrorComponent } from './dialogs/authenticate-error.component';
import { GuideData } from '../models/guides.models';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-guide-list',
  templateUrl: './guide-list.component.html',
  styleUrls: ['./guide-list.component.css']
})
export class GuideListComponent implements OnInit, OnDestroy {
  guidesSvc = inject(GuidesService);
  guides: any[] = [];
  imageSources: string[] = [];
  viewCounts: number[] = [];
  router = inject(Router);
  loginSvc = inject(LoginService);
  dialog = inject(MatDialog);
  filteredGuides: GuideData[] = [];
  spinner = inject(NgxSpinnerService);

  @ViewChild('searchInput')
  searchInput!: ElementRef<HTMLInputElement>;

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
  
  ngOnInit(): void {
    this.openSpinner();
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
    this.guidesSvc.getAllGuides().subscribe(guides => {
      this.guides = guides;
      console.info('guides: ', this.guides);
      this.imageSources = [];
      this.viewCounts = [];
      for (const guide of guides) {
        this.imageSources.push(this.getRandomValue(this.images, this.imageSources));
        this.viewCounts.push(Math.floor(Math.random() * (30000 - 100 + 1)) + 100);
      }
    });

    window.addEventListener('scroll', this.onScroll);
  }

  ngOnDestroy(): void {
      window.removeEventListener('scroll', this.onScroll);
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
      if (window.scrollY > 50) {
        scrollToTopButton.style.display = 'block';
      } else {
        scrollToTopButton.style.display = 'none';
      }
    };
  }

  getRandomValue(array: any[], exclude: any[] = []) {
    const filteredArray = array.filter(item => !exclude.includes(item));
    return filteredArray[Math.floor(Math.random() * filteredArray.length)];
  }

  onGuideClick(guide: any) {
    console.info('guide clicked: ', guide);
    const authorName = guide.author;
    console.info('author name: ', authorName);
    this.guidesSvc.setAuthorName(authorName);
    this.guidesSvc.setSelectedGuide(guide);
    this.router.navigate(['/guide', guide.uuid]);
  }

  onSearchInput(event: Event) {
    const searchText = (event.target as HTMLInputElement).value;
    if (searchText) {
      this.guidesSvc.searchGuides(searchText).subscribe((guides) => {
        this.filteredGuides = guides;
      });
    } else {
      this.filteredGuides = [];
    }
  }

  onSearchSubmit() {
    this.guides = this.filteredGuides;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}