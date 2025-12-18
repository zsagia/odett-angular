import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Item {
  id: number;
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-change-detection-signals',
  imports: [CommonModule],
  templateUrl: './change-detection-signals.html',
  styleUrl: './change-detection-signals.css'
})
export class ChangeDetectionSignals {
  // ✨ Signal: Reactive state management
  items = signal<Item[]>([
    { id: 1, name: 'Tanulás Angular-ból', completed: false },
    { id: 2, name: 'Házi feladat megírása', completed: false },
    { id: 3, name: 'Kód review', completed: true }
  ]);

  // Computed signal: automatically updates when items change
  completedCount = computed(() => 
    this.items().filter(item => item.completed).length
  );

  totalCount = computed(() => this.items().length);

  // ✅ Signal way: We can mutate AND it still works!
  toggleCompleted(itemId: number) {
    this.items.update(currentItems => 
      currentItems.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed }
          : item
      )
    );
    console.log('✨ Signal update - automatikusan frissül!');
  }

  // Alternative: Direct mutation with set
  toggleCompletedMutation(itemId: number) {
    const currentItems = this.items();
    const item = currentItems.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      // We need to call set() to notify Angular
      this.items.set([...currentItems]);
      console.log('✨ Signal set - frissült a mutáció után is!');
    }
  }

  addNewItem() {
    const newId = Math.max(...this.items().map(i => i.id)) + 1;
    this.items.update(items => [
      ...items,
      { id: newId, name: 'Új feladat', completed: false }
    ]);
  }

  removeItem(itemId: number) {
    this.items.update(items => items.filter(i => i.id !== itemId));
  }
}
