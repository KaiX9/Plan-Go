import { Component, OnInit, inject } from '@angular/core';
import { GuidesService } from '../services/guides.service';
import { DayData } from '../models/guides.models';

@Component({
  selector: 'app-full-guide',
  templateUrl: './full-guide.component.html',
  styleUrls: ['./full-guide.component.css']
})
export class FullGuideComponent implements OnInit {
  guide: any;
  guidesSvc = inject(GuidesService);
  authorName!: string;

  ngOnInit(): void {
    this.guide = this.guidesSvc.getSelectedGuide();
    console.info('guide: ', this.guide);
    this.authorName = this.guidesSvc.getAuthorName();
    console.info('author name: ', this.authorName);
  }

  getDayData(day: any): DayData {
    return day.value as DayData;
  }
}
