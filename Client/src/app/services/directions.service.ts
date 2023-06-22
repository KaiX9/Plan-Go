import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class DirectionsService {
    private requestSource = new BehaviorSubject<any>(null);
    currentRequest = this.requestSource.asObservable();

    private dirInstructionsSource = new BehaviorSubject<
        Array<
            | { maneuver: string; instruction: string; distance: string | undefined }
            | { name: string; address: string }
        >
    >([]);
    dirInstructions$ = this.dirInstructionsSource.asObservable();

    private isToolbarClickedSource = new BehaviorSubject<boolean>(false);
    isToolbarClicked$ = this.isToolbarClickedSource.asObservable();

    private distanceMatrixSource = new BehaviorSubject<
        google.maps.DistanceMatrixResponse | null
        >(null);
    distanceMatrix$ = this.distanceMatrixSource.asObservable();

    private distanceMatrixRequestSource = new BehaviorSubject<
        { origins: string[]; destinations: string[] } | undefined
    >(undefined);
    distanceMatrixRequest$ = this.distanceMatrixRequestSource.asObservable();

    private distAndDurSource = new BehaviorSubject<{ originName: string; destinationName: string; 
        distance: string; duration: string }[] | null>(null);
    distAndDur$ = this.distAndDurSource.asObservable();

    private placeNamesSource = new BehaviorSubject<string[]>([]);
    currentPlaceNames = this.placeNamesSource.asObservable();

    changeRequest(request: any) {
        this.requestSource.next(request);
    }

    updateDirectionsInstructions(
        instructions: Array<
            | { maneuver: string; instruction: string; distance: string | undefined }
            | { name: string; address: string }
        >
    ) {
        this.dirInstructionsSource.next(instructions);
    }

    updateIsToolbarClicked(isClicked: boolean) {
        this.isToolbarClickedSource.next(isClicked);
    }

    updateDistanceMatrix(response: google.maps.DistanceMatrixResponse | null) {
        this.distanceMatrixSource.next(response);
    }

    updateDistanceMatrixRequest(
        request: { origins: string[]; destinations: string[] } | undefined
    ) {
        this.distanceMatrixRequestSource.next(request);
    }

    updateDistanceAndDuration(data: { originName: string; destinationName: string; 
        distance: string; duration: string }[] | null) {
        this.distAndDurSource.next(data);
    }

    updatePlaceNames(placeNames: string[]) {
        this.placeNamesSource.next(placeNames);
    }
}