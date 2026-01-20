import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-greeting',
  imports: [CommonModule],
  templateUrl: './greeting.html',
  styleUrl: './greeting.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class Greeting {
@Input() name = '';
@Input() age = 0;
}
