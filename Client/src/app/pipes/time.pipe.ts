import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'time' })
export class TimePipe implements PipeTransform {
    transform(value: any): string {
        const atIndex = value.indexOf(' at ');
        const time = value.slice(atIndex + 11, atIndex + 20);
        return time;
    }
}