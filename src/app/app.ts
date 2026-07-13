import { Component, signal } from '@angular/core';
import { Header } from './header/header';
import { Hero } from './hero/hero';



@Component({
  selector: 'app-root',
  imports: 
  [
    Header,
    Hero,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-first-angular-app');
}
