import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Item {
  id: number;
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-item-list',
  imports: [CommonModule],
  template: `
    <div class="items-list">
      <div class="list-header">
        <h3>📋 Feladatok listája</h3>
        <div class="render-counter" [class.render-flash]="justRendered">
          🔄 Template renderelve: {{ renderCount }}x
        </div>
      </div>
      
      @for (item of items; track item.id) {
        <div class="item" [class.completed]="item.completed">
          <span class="checkbox">{{ item.completed ? '✅' : '⬜' }}</span>
          <span class="name">{{ item.name }}</span>
          <span class="status">{{ item.completed ? 'Kész' : 'Folyamatban' }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .items-list {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .list-header h3 {
      margin: 0;
      color: #34495e;
    }
    
    .render-counter {
      background: #2196f3;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }
    
    .render-counter.render-flash {
      background: #4caf50;
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
    }

    .item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .item.completed {
      background: #d4edda;
      opacity: 0.8;
    }

    .checkbox {
      font-size: 1.5rem;
      min-width: 30px;
    }

    .name {
      flex: 1;
      font-weight: 500;
      color: #2c3e50;
    }

    .item.completed .name {
      text-decoration: line-through;
      color: #6c757d;
    }

    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .item:not(.completed) .status {
      background: #fff3cd;
      color: #856404;
    }

    .item.completed .status {
      background: #28a745;
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemList implements OnChanges, AfterViewChecked {
  @Input() items: Item[] = [];
  
  renderCount = 0;
  checkCount = 0;
  justRendered = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      console.log('🔵 ItemList ngOnChanges - @Input megváltozott!');
      console.log('   → Ez csak akkor fut, amikor az items referenciája változik');
      console.log('   → OnPush miatt csak emiatt renderelődik újra a komponens');

      this.renderCount++;
    }
  }

  ngAfterViewChecked() {
    this.checkCount++;


    console.log('🔄 ItemList AfterViewChecked - ellenőrzés:', this.checkCount);
    console.log('   → Ez akkor fut, amikor Angular frissítette a DOM-ot', this.renderCount);
    console.log('   → OnPush-nál csak új @Input referenciánál történik!');
    
  }
}
