import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AutopilotOverlayComponent,
  AutopilotTooltipComponent,
  AutopilotControlsComponent
} from '@zssz-soft/demo-autopilot-core';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AutopilotOverlayComponent,
    AutopilotTooltipComponent,
    AutopilotControlsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'odett-angular';
}
