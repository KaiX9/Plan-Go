import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GuidesService } from '../services/guides.service';
import { Place } from '../models/map.models';
import { Router } from '@angular/router';
import { GuideData, TransformedData } from '../models/guides.models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SavedGuideComponent } from './dialogs/saved-guide.component';

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

  ngOnInit(): void {
    this.selectedUuid = this.guidesSvc.getSelectedUuid();
    this.selectedCity = this.guidesSvc.getSelectedCity();
    this.itineraryData = this.guidesSvc.getItineraryData();
    console.info('itineraryData: ', this.itineraryData);
    this.dates = [
      ...new Set(this.itineraryData.map((item: any) => item.date))
    ] as string[];
    console.info('dates: ', this.dates);
    this.guideForm = this.createGuideForm();
  }

  createGuideForm(): FormGroup {
    const cityName = this.selectedCity 
      ? this.selectedCity.split(',')[0].trim()
      : '';
    const commentsGroup = new FormGroup({});
    const dates = [...new Set(this.itineraryData.map((item: any) => item.date))];
    dates.forEach(date => {
      commentsGroup.addControl(date as string, new FormControl(''));
    });
    return this.fb.group({
      name: this.fb.control<string>(cityName + ' Guide', [ Validators.required ]),
      summary: this.fb.control<string>('', [ Validators.required ]),
      comments: commentsGroup
    });
  }

  getPlacesForDate(date: string): Place[] {
    return this.itineraryData.filter((item: any) => item.date === date);
  }

  goBack() {
    this.router.navigate(['/guide']);
  }

  shareGuide() {
    const title = this.guideForm.get('name')?.value;
    const summary = this.guideForm.get('summary')?.value;
    const comments = this.guideForm.get('comments')?.value;
    console.info('title', title);
    console.info('summary', summary);
    console.info('comments', comments);
    const result = this.transformData(this.dates, comments, this.getPlacesForDate.bind(this));
    const data: GuideData = {
      uuid: this.selectedUuid,
      title: title,
      summary: summary,
      guideData: result
    };
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
    dates.forEach((date, index) => {
      const day = `Day ${index + 1}`;
      result[day] = {
        places: getPlacesForDate(date).map(place => place.name),
        comment: comments[date]
      };
    });
    console.info('result', result);
    return result;
  }
}
