import { Component, OnInit, inject } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticateErrorComponent } from './dialogs/authenticate-error.component';
import { GuidesService } from '../services/guides.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loginSvc = inject(LoginService);
  router = inject(Router);
  dialog = inject(MatDialog);
  guidesSvc = inject(GuidesService);
  imageSources: string[] = [];
  randomNames: string[] = [];
  viewCounts: number[] = [];
  selectedGuides: any[] = [];

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

  names = [
    'Mahalia Pugh', 'Rebekka Cisternino', 'Amiran Parisi', 'Amour Aaron', 
    'Dashiell Nowakowski', 'Xanthos Vencel', 'Michaël Abioye', 'Lutz Hailey', 
    'Matthieu Rutkowski', 'Regina Royer', 'Esha Piontek', 'Steinunn Bourne',
    'Karine Suggitt', 'Nioclás Vragi', 'Rusticus Goyathlay'
  ];

  ngOnInit(): void {
    this.loginSvc.dashboard().subscribe(
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
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * guides.length);
        this.selectedGuides.push(guides[randomIndex]);
        guides.splice(randomIndex, 1);
      }
      this.imageSources = [];
      this.randomNames = [];
      this.viewCounts = [];
      for (const guide of this.selectedGuides) {
        this.imageSources.push(this.getRandomValue(this.images, this.imageSources));
        this.randomNames.push(this.getRandomValue(this.names, this.randomNames));
        this.viewCounts.push(Math.floor(Math.random() * (30000 - 100 + 1)) + 100);
      }
    });
  }

  getRandomValue(array: any[], exclude: any[] = []) {
    const filteredArray = array.filter(item => !exclude.includes(item));
    return filteredArray[Math.floor(Math.random() * filteredArray.length)];
  }

  onGuideClick(guide: any) {
    console.info('guide clicked: ', guide);
    const guideIndex = this.selectedGuides.indexOf(guide);
    const authorName = this.randomNames[guideIndex];
    this.guidesSvc.setAuthorName(authorName);
    this.guidesSvc.setSelectedGuide(guide);
    this.router.navigate(['/guide', guide.uuid]);
  }
}