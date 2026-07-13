import { Component, inject } from '@angular/core';
import { WeatherTransfer } from '../weather-transfer';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-header',
  imports: 
    [
      CommonModule,
    ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private _weatherTransfer: WeatherTransfer = inject(WeatherTransfer);

  public isInputActive: boolean = false;
  public farAndCel: boolean = true;

  public time$: Observable<string> = this._weatherTransfer.time$;


  public iconTemp: string = '/free-icon-celsius-3506013.png';
  public iconSunMoon: string[] = [
    '/free-icon-sun-5497397.png',
    '/free-icon-moon-867904.png'
  ];

  addInput() {
    this.isInputActive = !this.isInputActive;
  }

  public fAndC() {
    this.farAndCel = !this.farAndCel;

    this._weatherTransfer.formTemp(this.farAndCel);

    if (this.farAndCel) {
      this.iconTemp = '/free-icon-fahrenheit-degrees-3506023.png';
    } else {
      this.iconTemp = '/free-icon-celsius-3506013.png';
    }
  }

  public onSearch(city: string): void {
    if (city.trim()) this._weatherTransfer.changeCity(city);
  }


}
