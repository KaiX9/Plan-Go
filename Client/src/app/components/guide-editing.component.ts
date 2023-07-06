import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GuidesService } from '../services/guides.service';
import { Place } from '../models/map.models';

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

  ngOnInit(): void {
    this.selectedCity = this.guidesSvc.getSelectedCity();
    this.itineraryData = this.guidesSvc.getItineraryData();
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
}
