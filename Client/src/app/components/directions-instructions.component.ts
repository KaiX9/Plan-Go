import { Component, OnInit, inject } from '@angular/core';
import { DirectionsService } from '../services/directions.service';

@Component({
  selector: 'app-directions-instructions',
  templateUrl: './directions-instructions.component.html',
  styleUrls: ['./directions-instructions.component.css']
})
export class DirectionsInstructionsComponent implements OnInit {
  directionsInstructions: string[] = [];
  directionsSvc = inject(DirectionsService);

  ngOnInit(): void {
      this.directionsSvc.dirInstructions$.subscribe(
        instructions => (this.directionsInstructions = instructions)
      );
  }

  goBack() {
    this.directionsSvc.updateIsToolbarClicked(false);
  }
}