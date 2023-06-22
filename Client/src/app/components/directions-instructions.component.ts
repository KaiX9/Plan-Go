import { Component, OnInit, inject } from '@angular/core';
import { DirectionsService } from '../services/directions.service';

@Component({
  selector: 'app-directions-instructions',
  templateUrl: './directions-instructions.component.html',
  styleUrls: ['./directions-instructions.component.css']
})
export class DirectionsInstructionsComponent implements OnInit {
  directionsInstructions: Array<
    | { maneuver: string; instruction: string; distance: string | undefined }
    | { name: string; address: string } 
  > = [];
  directionsSvc = inject(DirectionsService);
  distanceMatrix: google.maps.DistanceMatrixResponse | null = null;
  distances: string[] = [];
  durations: string[] = [];
  placeNames: string[] = [];
  locations: Array<{
    originName?: string;
    originAddress?: string;
    destinationName?: string;
    destinationAddress?: string;
    distance?: string;
    duration?: string;
  }> = [];

  ngOnInit(): void {
    this.directionsSvc.dirInstructions$.subscribe(instructions => {
      (this.directionsInstructions = instructions);
      console.info('instructions: ', instructions);
    }
    );
    this.directionsSvc.distanceMatrix$.subscribe((response) => {
      this.distanceMatrix = response;
      console.info('distanceMatrix: ', this.distanceMatrix);
    })
    this.directionsSvc.distAndDur$.subscribe(data => {
      if (data) {
        this.placeNames = [];
        this.distances = [];
        this.durations = [];
        data.forEach((item) => {
          this.placeNames.push(item.originName);
          this.distances.push(item.distance);
          this.durations.push(item.duration);
          console.info('placeNames: ', this.placeNames);
          console.info('distances: ', this.distances);
          console.info('durations: ', this.durations);
        });
      }
      this.locations = [];
      this.generateLocations();
    });
  }

  goBack() {
    this.directionsSvc.updateIsToolbarClicked(false);
  }

  generateLocations() {
    let currentLocation: {
      originName?: string;
      originAddress?: string;
      destinationName?: string;
      destinationAddress?: string;
      distance?: string;
      duration?: string;
    } = {};
    let distanceIndex = 0;
    let durationIndex = 0;
    for (let i = 0; i < this.directionsInstructions.length; i++) {
      const item = this.directionsInstructions[i];
      if ('name' in item) {
        if (!currentLocation.originName) {
          currentLocation.originName = item.name;
          currentLocation.originAddress = item.address;
        } else {
          currentLocation.destinationName = item.name;
          currentLocation.destinationAddress = item.address;
          currentLocation.distance = this.distances[distanceIndex];
          currentLocation.duration = this.durations[durationIndex];
          if (currentLocation.originName !== currentLocation.destinationName) {
            this.locations.push(currentLocation);
            distanceIndex++;
            durationIndex++;
          }
          currentLocation = {
            originName: item.name,
            originAddress: item.address
          };
        }
      }
    }
    console.info('locations: ', this.locations);
  }

  isInstruction(
    instruction:
      | { maneuver: string; instruction: string; distance: string | undefined }
      | { address: string }
  ): instruction is { maneuver: string; instruction: string; distance: string | undefined 
  } {
    return (instruction as any).maneuver !== undefined;
  }

  isFirstOccurrence(instruction: any, index: number): boolean {
    return (
      index === 
      this.directionsInstructions.findIndex(
        (item) => 
        !this.isInstruction(item) && 
        item.name === instruction.name && 
        item.address === instruction.address
      )
    );
  }
}