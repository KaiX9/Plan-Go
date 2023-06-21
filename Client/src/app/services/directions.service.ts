import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class DirectionsService {
    private requestSource = new BehaviorSubject<any>(null);
    currentRequest = this.requestSource.asObservable();

    private dirInstructionsSource = new BehaviorSubject<string[]>([]);
    dirInstructions$ = this.dirInstructionsSource.asObservable();

    private isToolbarClickedSource = new BehaviorSubject<boolean>(false);
    isToolbarClicked$ = this.isToolbarClickedSource.asObservable();

    changeRequest(request: any) {
        this.requestSource.next(request);
    }

    updateDirectionsInstructions(instructions: string[]) {
        this.dirInstructionsSource.next(instructions);
    }

    updateIsToolbarClicked(isClicked: boolean) {
        this.isToolbarClickedSource.next(isClicked);
    }
}