import { CommonModule, isPlatformBrowser} from '@angular/common';
import { Component, ChangeDetectorRef, OnInit, OnDestroy, Inject, Renderer2, DOCUMENT, PLATFORM_ID } from '@angular/core';
import { Subscription } from 'rxjs';
import { WeatherTransfer } from '../weather-transfer';

@Component({
  selector: 'app-hero',
  imports: 
  [
    CommonModule
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit, OnDestroy {
  public flagTemp: boolean = false;
  public forecastFlag: boolean = false;
  public moreInfoFlag: boolean = false;
  public noCityFlag: boolean = true;
  public errorFlag: boolean = false;
  public errorStatus: string = 'hidden';

  public currentDate: Date = new Date();
  public dateMoreTomorr: string = '';
  public currentCity: string = 'Kharkiv';
  public cityThis: string = '';
  public temper: number = 0;
  public temperEvar: number = 0;
  public temperEvarMin: number = 0;
  public temperEvarMax: number = 0;
  public minTemperature: number = 0;
  public maxTemperature: number = 0;
  public rain: number = 0;
  public rainTomorr: number = 0;
  public windSpeedTomorr: number = 0;
  public windSpeed: number = 0;
  public whenDay: string = 'Today';
  public imgPeriodDay: string = '';
  public forecastData: any[] = [];
  public forecastToday: any[] = [];
  public forecastWeekly: any[] = [];
  public clickDay: any[] = [];
  public termoIcon: string[] = [
    'free-icon-thermometer-1164915.png', 
    'free-icon-thermometer-1164913.png'
  ];

  private _timerId: any;
  private _API_KEY: string = '47b2b44ce9530c6b607cd6b059750f9b';
  private _API_KEY_PHOTO: string = 'Yth-pGDG5-KXka42WFEV0VylWpeHouNVAEDXtcLLJMc';
  private _lastBgClass: string = '';
  private _citySub!: Subscription;
  private _tempSub!: Subscription;

  constructor(
    private _cdr: ChangeDetectorRef, 
    private _renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private paltformId: Object,
    private _weatherTransfer: WeatherTransfer
  ) {}

  public ngOnInit() {
    this._timerId = setInterval(() => {
      this.currentDate = new Date();
      const timeString = this.currentDate.toLocaleTimeString();
      this._weatherTransfer.upDate(timeString);
      this._cdr.detectChanges();
    }, 500);

    this._citySub = this._weatherTransfer.citySearch$.subscribe((city: string) => {
      if (city) {
        this.updateData(city);
      }
    });

    this._tempSub = this._weatherTransfer.varTemp$.subscribe((flag: boolean) => {
      this.flagTemp = flag;
      this._cdr.detectChanges();
    });

    if (this.currentCity) this.updateData(this.currentCity);
    this.generateWeeklyForcast();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.updateData(this.currentCity));
    }
    
  }

  public async updateData(city: string): Promise<void> {
    try {
      if (!city || city.trim() === '') {
        throw new Error('Місто не знайдено');
      }; 

      const weathData = await this.weatherData(city);
      const weathDataNow = await this.weatherDataNow(city);
      this.cityThis = await this.photosData(city);

      if (!weathData) {
        throw new Error('Місто не знайдено');
      };

      this.forecastData = weathData;
      this.updateVarNow(weathDataNow, weathData);
      this.updateBg(weathData);

      const todayString: string = new Date()
        .toLocaleDateString()
        .replaceAll('.', '-')
        .split('-')
        .reverse()
        .join('-');

      let countCArd: number = 5;
      
      if (typeof window !== 'undefined' && window.innerWidth <= 576) countCArd = 3;

      this.forecastToday = this.forecastData.filter(item => {
        const date: string = item.dt_txt.split(' ')[0];
        return date === todayString;
      }).slice(0, countCArd);

      if (this.forecastToday.length === 0) {
        this.forecastToday = this.forecastToday.slice(0, 4);
      }

      this.generateWeeklyForcast();
      this.currentCity = city;
      
      this._cdr.detectChanges();
      this._cdr.markForCheck();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public generateWeeklyForcast(): void {
    if (this.forecastWeekly.length > 0) return;

    let tomorrowCards = [];

    for (let i = 1; i <= 8; i++) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + i);

      const tomorrowString: string = tomorrow.toISOString().slice(0, 10);

      tomorrowCards = this.forecastData.filter(item => {
      const date: string = item.dt_txt.split(' ')[0];
        return date === tomorrowString;
      });

      if (tomorrowCards.length > 0) {
        let totalTemp: number = 0;

        tomorrowCards.forEach(item => {
          totalTemp += item.main.temp;
        });

        const eveTemp: number = totalTemp / tomorrowCards.length;

        this.forecastWeekly.push({
          temp: Math.floor(eveTemp),
          date: tomorrow,
          icon: tomorrowCards[0].weather[0].icon,
          description: tomorrowCards[0].weather[0].description,
        });
      }
    }
  }

  public async weatherDataNow(city: string): Promise<any> {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this._API_KEY}&units=metric`);
      if (!response.ok) return;
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      this.errorFlag = true;
      this.errorStatus = 'active';
      throw error;
    }
  }

  public async weatherData(city: string): Promise<any> {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this._API_KEY}&units=metric`);
      if (!response.ok) {
        throw new Error('Місто не знайдено');
      };
      const data = await response.json();
      return data.list;
    } catch (error) {
      console.error(error);
      this.errorFlag = true;
      this.errorStatus = 'active';
      throw error;
    }
  }

  public async photosData(city: string): Promise<any> {
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=${this._API_KEY_PHOTO}`);
      if (!response.ok) throw new Error('Фото не знайдено');
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
    } catch (error) {
      console.error(error);
      this.errorFlag = true;
      this.errorStatus = 'active';
      throw error;
    }
  }

  public updateVarNow(dataNow: any, dataList: any): void {
    const iconCode: string =  dataNow.weather[0].icon;

    this.temper = Math.floor(dataNow.main.temp);
    this.maxTemperature = Math.floor(dataNow.main.temp_max);
    this.minTemperature = Math.floor(dataNow.main.temp_min);
    this.imgPeriodDay = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    this.windSpeed = dataNow.wind.speed;
    this.rain = dataList[0].rain?.['3h'] ? dataList[0].rain?.['3h'] * 100 : 0;
  }

  public updateBg(data: any): void {
    const rigthList = data[0];
    const icon = data[0].weather[0].icon;

    let newBgClass: string = 'bg-sunny';

    if (icon.endsWith('n')) {
      newBgClass = 'bg-night';
    } else if (rigthList.weather[0].main === 'Rain') {
      newBgClass = 'bg-rainy'
    }

    if (this._lastBgClass) {
      this._renderer.removeClass(this.document.body, this._lastBgClass);
    }

    this._renderer.addClass(this.document.body, newBgClass);

    this._lastBgClass = newBgClass;
  }

  public moreInfoDay(date: any, flag: boolean): void {
    this.moreInfoFlag = flag;
    this.clickDay = [];

    if (date && this.moreInfoFlag) {
      const localDate: string = new Date(date)
        .toLocaleDateString()
        .replaceAll('.', '-')
        .split('-')
        .reverse()
        .join('-');

      this.dateMoreTomorr = localDate;

      this.clickDay = this.forecastData.filter(day => {
        const dateDay = day.dt_txt.split(' ')[0];
        if (dateDay === localDate) {
          return day;
        }
      });

      if (this.clickDay.length === 0) return;

      let totalTemp: number = 0;
      let totalTempMin: number = 0;
      let totalTempMax: number = 0;
      let rain: number = 0;
      let windSpeed: number = 0;

      this.clickDay.forEach(item => {
        totalTemp += item.main.temp;
        totalTempMin += item.main.temp_min;
        totalTempMax += item.main.temp_max;
        windSpeed += item.wind.speed;
        rain += item.rain?.['3h'] ?? 0;
      });

      this.temperEvar = Math.floor(totalTemp / this.clickDay.length);
      this.temperEvarMin = Math.floor(totalTempMin / this.clickDay.length);
      this.temperEvarMax = Math.floor(totalTempMax / this.clickDay.length);
      this.windSpeedTomorr = Math.floor(windSpeed / this.clickDay.length);
      this.rainTomorr = Math.floor(rain / this.clickDay.length * 100);
    }
  }

  public todayWeeklyFlag(flag: boolean, date?: string): void {
    this.forecastFlag = flag;
    if (this.forecastFlag) this.generateWeeklyForcast();
    this._cdr.detectChanges();
  }

  public backMoreInfo(): void {
    this.moreInfoFlag = false;
    this._cdr.detectChanges();
  }

  public backError(): void {
    this.errorFlag = false;
    this.errorStatus = 'closed';

    setTimeout(() => {
      this.errorStatus = 'hidden';
      this._cdr.detectChanges();
    },800);
  }

  public ngOnDestroy() {
    if (this._timerId) clearInterval(this._timerId);
    if (this._citySub) this._citySub.unsubscribe();
    if (this._tempSub) this._tempSub.unsubscribe();
  }
}
