import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChangeDetectionDemo } from './change-detection-demo/change-detection-demo';
import { ChangeDetectionOnPush } from './change-detection-onpush/change-detection-onpush';
import { ChangeDetectionObservable } from './change-detection-observable/change-detection-observable';
import { ChangeDetectionSignals } from './change-detection-signals/change-detection-signals';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    ChangeDetectionDemo,
    ChangeDetectionOnPush,
    ChangeDetectionObservable,
    ChangeDetectionSignals
  ],
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
