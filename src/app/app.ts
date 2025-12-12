import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Greeting } from './greeting/greeting';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Greeting],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'odett-angular';
  name = signal('Odett');
  age = 15;

  constructor() {
    this.name.set('Welcome Odett');
  }
}
