import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GuidesService } from '../services/guides.service';
import { LoginService } from '../services/login.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticateErrorComponent } from './dialogs/authenticate-error.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-user-guides',
  templateUrl: './user-guides.component.html',
  styleUrls: ['./user-guides.component.css']
})
export class UserGuidesComponent implements OnInit {
  router = inject(Router);
  guidesSvc = inject(GuidesService);
  guides: any[] = [];
  imageSources: string[] = [];
  viewCounts: number[] = [];
  loginSvc = inject(LoginService);
  dialog = inject(MatDialog);
  spinner = inject(NgxSpinnerService);

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
    this.guidesSvc.getGuidesForUser().subscribe(guides => {
      this.guides = guides;
      console.info('guides: ', this.guides);
      this.imageSources = [];
      this.viewCounts = [];
      for (const guide of guides) {
        this.imageSources.push(this.getRandomValue(this.images, this.imageSources));
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
}