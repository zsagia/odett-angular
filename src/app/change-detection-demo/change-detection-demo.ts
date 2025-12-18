import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Item {
  id: number;
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-change-detection-demo',
  imports: [CommonModule],
  templateUrl: './change-detection-demo.html',
  styleUrl: './change-detection-demo.css',
  // Start with Default change detection
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChangeDetectionDemo {
  // Step 1: Using plain array with mutable objects
  items: Item[] = [
    { id: 1, name: 'Tanulás Angular-ból', completed: false },
    { id: 2, name: 'Házi feladat megírása', completed: false },
    { id: 3, name: 'Kód review', completed: true }
  ];

  // Method that MUTATES the object property
  toggleCompleted(item: Item) {
    // ⚠️ This mutates the object directly
    item.completed = !item.completed;
    console.log('Item toggled (mutation):', item);
  }

  // Method that creates a NEW array (immutable way)
  toggleCompletedImmutable(item: Item) {
    // ✅ This creates a new array with a new object
    this.items = this.items.map(i => 
      i.id === item.id 
        ? { ...i, completed: !i.completed }
        : i
    );
    console.log('Item toggled (immutable):', item);
  }

  getCurrentStrategy(): string {
    // This is a helper to show which strategy is active
    return 'Default';
  }
}
