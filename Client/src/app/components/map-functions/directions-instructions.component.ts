import { Component, OnInit, inject } from '@angular/core';
import { DirectionsService } from '../../services/directions.service';
import { combineLatest } from 'rxjs';

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
  currentInstructionIndex = 0;
  instructionsByLocation: any[][] = [];

  ngOnInit(): void {
    combineLatest([
      this.directionsSvc.dirInstructions$,
      this.directionsSvc.distanceMatrix$,
      this.directionsSvc.distAndDur$
    ]).subscribe(([instructions, distanceMatrix, data]) => {
      this.directionsInstructions = instructions;
      this.distanceMatrix = distanceMatrix;
      if (data) {
        this.placeNames = [];
        this.distances = [];
        this.durations = [];
        data.forEach((item) => {
          this.placeNames.push(item.originName);
          this.distances.push(item.distance);
          this.durations.push(item.duration);
        });
      }
      this.locations = [];
      this.generateLocations();
      this.currentInstructionIndex = 0;
      this.generateInstructionsByLocation();
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
  }

  isInstruction(
    instruction:
      | { maneuver: string; instruction: string; distance: string | undefined }
      | { address: string }
  ): instruction is { maneuver: string; instruction: string; distance: string | undefined 
  } {
    const result = (instruction as any).maneuver !== undefined;
    return result;
  }

  getNextInstructions(): any[] {
    if (this.currentInstructionIndex >= this.directionsInstructions.length) {
      return [];
    }
    const instructions = [];
    while (
      this.currentInstructionIndex < this.directionsInstructions.length && 
      ('name' in this.directionsInstructions[this.currentInstructionIndex])
    ) {
      this.currentInstructionIndex++;
    }
    while (
      this.currentInstructionIndex < this.directionsInstructions.length && 
      !('name' in this.directionsInstructions[this.currentInstructionIndex])
    ) {
      if (this.isInstruction(this.directionsInstructions[this.currentInstructionIndex])) {
        instructions.push(this.directionsInstructions[this.currentInstructionIndex]);
      }
      this.currentInstructionIndex++;
    }
    if (instructions.length === 0) {
      return instructions;
    }
    return instructions;
  }

  generateInstructionsByLocation(): void {
    this.instructionsByLocation = [];
    for (let i = 0; i < this.locations.length; i++) {
      const instructions = this.getNextInstructions();
      if (instructions.length > 0) {
        this.instructionsByLocation.push(instructions);
      }
    }
  }
}