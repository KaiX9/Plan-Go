import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { SaveItineraryService } from '../services/save-itinerary.service';
import { Observable, Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { GuidesService } from '../services/guides.service';
import { LoginService } from '../services/login.service';
import { AuthenticateErrorComponent } from './dialogs/authenticate-error.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements OnInit, OnDestroy {
  guidesSvc = inject(GuidesService);
  writeGuideList$!: Observable<any[]>;
  selectedItineraryUuid!: string;
  selectedCity!: string;
  fullItinerary$!: Subscription;
  router = inject(Router);
  saveItinerarySvc = inject(SaveItineraryService);
  loginSvc = inject(LoginService);
  dialog = inject(MatDialog);

  ngOnInit(): void {
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
    this.writeGuideList$ = this.guidesSvc.getWriteGuideList();
  }

  ngOnDestroy(): void {
    if (this.fullItinerary$) {
      this.fullItinerary$.unsubscribe();
    }
  }

  onSelectionChange(event: MatSelectChange) {
    this.selectedItineraryUuid = event.value;
    this.writeGuideList$.subscribe(writeGuideList => {
      const selectedItinerary = writeGuideList.find(
        itinerary => itinerary.uuid === event.value
      );
      if (selectedItinerary) {
        this.selectedCity = selectedItinerary.city;
      }
    });
  }

  onWriting(uuid: string) {
    console.info('uuid: ', uuid);
    this.guidesSvc.setSelectedUuid(uuid);
    this.fullItinerary$ = this.saveItinerarySvc.getFullItinerary(uuid).subscribe(
      response => {
        console.info('response: ', response);
        this.guidesSvc.setItineraryData(response, this.selectedCity);
        this.router.navigate(['/guide/edit']);
      }
    );
  }
}