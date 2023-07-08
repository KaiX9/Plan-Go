import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { GuidesService } from '../services/guides.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guide-list',
  templateUrl: './guide-list.component.html',
  styleUrls: ['./guide-list.component.css']
})
export class GuideListComponent implements OnInit {
  guidesSvc = inject(GuidesService);
  guides: any[] = [];
  imageSources: string[] = [];
  randomNames: string[] = [];
  viewCounts: number[] = [];
  router = inject(Router);

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
    this.guidesSvc.getAllGuides().subscribe(guides => {
      this.guides = guides;
      console.info('guides: ', this.guides);
      this.imageSources = [];
      this.randomNames = [];
      this.viewCounts = [];
      for (const guide of guides) {
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
    const guideIndex = this.guides.indexOf(guide);
    const authorName = this.randomNames[guideIndex];
    console.info('author name: ', authorName);
    this.guidesSvc.setAuthorName(authorName);
    this.guidesSvc.setSelectedGuide(guide);
    this.router.navigate(['/guide', guide.uuid]);
  }
}