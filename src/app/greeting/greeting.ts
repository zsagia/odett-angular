import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-greeting',
  imports: [CommonModule],
  templateUrl: './greeting.html',
  styleUrl: './greeting.css',

})
export class Greeting {
@Input() name = '';
@Input() age = 0;
}
