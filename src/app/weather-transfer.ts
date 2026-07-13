import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherTransfer {
  private _citySearch = new Subject<string>();
  private _varTemp = new BehaviorSubject<boolean>(true);
  private _time = new BehaviorSubject<string>('');

  public citySearch$ = this._citySearch.asObservable();
  public varTemp$ = this._varTemp.asObservable();
  public time$ = this._time.asObservable();

  public changeCity(city: string): void {
    this._citySearch.next(city);
  }

  public formTemp(flag: boolean): void {
    this._varTemp.next(flag);
  }

  public upDate(time: string): void {
    this._time.next(time);
  }
}
