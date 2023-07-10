import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GuidesService } from '../services/guides.service';
import { Place } from '../models/map.models';
import { Router } from '@angular/router';
import { GuideData, TransformedData } from '../models/guides.models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SavedGuideComponent } from './dialogs/saved-guide.component';
import { SaveItineraryService } from '../services/save-itinerary.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-guide-editing',
  templateUrl: './guide-editing.component.html',
  styleUrls: ['./guide-editing.component.css']
})
export class GuideEditingComponent implements OnInit {
  guideForm!: FormGroup;
  fb = inject(FormBuilder);
  guidesSvc = inject(GuidesService);
  itineraryData: any;
  selectedCity!: string;
  dates!: string[];
  router = inject(Router);
  selectedUuid!: string;
  dialog = inject(MatDialog);
  guide: any;
  saveItinerarySvc = inject(SaveItineraryService);
  _location = inject(Location);

  ngOnInit(): void {
    const guide = history.state.guide;
    console.info('guide', guide);
    if (guide) {
      this.guide = guide;
      this.selectedUuid = this.guide.uuid;
      const defaultValues = this.transformGuideDataToDefaultValues(guide);
      this.guideForm = this.createGuideForm(defaultValues);
    } else {
      this.selectedUuid = this.guidesSvc.getSelectedUuid();
      this.selectedCity = this.guidesSvc.getSelectedCity();
      this.itineraryData = this.guidesSvc.getItineraryData();
      console.info('itineraryData: ', this.itineraryData);
      this.dates = [
        ...new Set(this.itineraryData.map((item: any) => item.date))
      ] as string[];
      console.info('dates: ', this.dates);
      this.guide = null;
      this.guideForm = this.createGuideForm();
      console.info('guideForm: ', this.guideForm);
    }
  }

  createGuideForm(defaultValues: any = {}): FormGroup {
    console.info('createGuideForm called');
    const cityName = this.selectedCity 
      ? this.selectedCity.split(',')[0].trim()
      : '';
      console.info('cityName: ', cityName);
    const commentsGroup = new FormGroup({});
    if (!this.guide) {
      const dates = [...new Set(this.itineraryData.map((item: any) => item.date))];
      dates.forEach(date => {
        commentsGroup.addControl(date as string, new FormControl(''));
      });
    } else {
      const dates = Object.keys(defaultValues.comments);
      dates.forEach(date => {
        const comment = defaultValues.comments[date];
        console.info('date: ', date, 'comment: ', comment);
        commentsGroup.addControl(date as string, new 
          FormControl(comment));
      });
    }
    const guideForm = this.fb.group({
      name: this.fb.control<string>(defaultValues.title || cityName + ' Guide', [ 
        Validators.required ]),
      summary: this.fb.control<string>(defaultValues.summary || '', [ Validators.required ]),
      comments: commentsGroup
    });
    console.info('guideForm value: ', guideForm.value);
    return guideForm;
  }

  transformGuideDataToDefaultValues(guideData: GuideData): any {
    const defaultValues: { title: string; summary: string; comments: { [day: string]: 
      string } } = {
      title: guideData.title,
      summary: guideData.summary,
      comments: {}
    };
    Object.entries(guideData.guideData).forEach(([day, data]) => {
      defaultValues.comments[day] = data.comment;
    });
    return defaultValues;
  }

  getDaysFromDates(dates: string[]): string[] {
    const days = [];
    for (let i = 0; i < dates.length; i++) {
      days.push(`Day ${i + 1}`);
    }
    return days;
  }

  getCommentDays(): string[] {
    return Object.keys(this.guideForm.get('comments')?.value);
  }

  getPlacesForDate(date: string): Place[] {
    return this.itineraryData.filter((item: any) => item.date === date);
  }

  getPlacesForDay(day: string): string[] {
    if (this.guide && this.guide.guideData[day]) {
      console.info('places for day: ', this.guide.guideData[day].places);
      return this.guide.guideData[day].places;
    }
    return [];
  }

  goBack() {
    this._location.back();
  }

  shareGuide() {
    const title = this.guideForm.get('name')?.value;
    const summary = this.guideForm.get('summary')?.value;
    const comments = this.guideForm.get('comments')?.value;
    console.info('title', title);
    console.info('summary', summary);
    console.info('comments', comments);
    const result = this.transformData(this.dates, comments, this.getPlacesForDate.bind(this));
    const author = localStorage.getItem('name');
    const data: GuideData = {
      uuid: this.selectedUuid,
      title: title,
      summary: summary,
      guideData: result
    };
    if (author) {
      data.author = author;
    }
    this.guidesSvc.saveGuide(data).subscribe(
      response => {
        console.info('response after saving guide: ', response);
        if (response.message === 'guide saved') {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '300px';
          dialogConfig.height = '150px';
          this.dialog.open(SavedGuideComponent, dialogConfig);
        }
      }
    );
  }

  transformData(dates: string[], comments: any, getPlacesForDate: (date: string) 
    => Place[]): TransformedData {
    const result: TransformedData = {};
    if (this.guide) {
      const days = this.getCommentDays();
      days.forEach(day => {
        result[day] = {
          places: this.getPlacesForDay(day),
          comment: comments[day]
        };
      });
    } else {
      dates.forEach((date, index) => {
        const day = `Day ${index + 1}`;
        result[day] = {
          places: getPlacesForDate(date).map(place => place.name),
          comment: comments[date]
        };
      });
    }
    console.info('result', result);
    return result;
  }
}
