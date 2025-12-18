import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ItemList } from '../item-list/item-list';

interface Item {
  id: number;
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-change-detection-observable',
  imports: [CommonModule, ItemList],
  templateUrl: './change-detection-observable.html',
  styleUrl: './change-detection-observable.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChangeDetectionObservable {
  // BehaviorSubject - reactive state with Observables
  private itemsSubject = new BehaviorSubject<Item[]>([
    { id: 1, name: 'Tanulás Angular-ból', completed: false },
    { id: 2, name: 'Házi feladat megírása', completed: false },
    { id: 3, name: 'Kód review', completed: true }
  ]);

  // Observable that components can subscribe to
  items$ = this.itemsSubject.asObservable();

  renderCount = 0;

  ngDoCheck() {
    this.renderCount++;
    console.log('🔄 Parent (Default) - Komponens ÚJRA RENDERELŐDÖTT!', this.renderCount);
  }

  // ❌ Mutates object - won't work with OnPush child even with Observable
  mutateItem() {
    const currentItems = this.itemsSubject.value;
    const firstItem = currentItems[0];
    firstItem.completed = !firstItem.completed;
    
    // Emit the SAME array reference
    this.itemsSubject.next(currentItems);
    
    console.log('❌ Observable emit - de AZONOS referencia!');
    console.log('   → Parent CD fut');
    console.log('   → Observable emit-el');
    console.log('   → DE! Child OnPush NEM frissül (azonos referencia)');
    console.log('   → Async pipe sem segít ha a referencia nem változik!');
  }

  // ✅ Creates new reference - will work with OnPush child
  updateImmutable() {
    const currentItems = this.itemsSubject.value;
    
    // Create NEW array with NEW object
    const newItems = currentItems.map((item, index) => 
      index === 0 
        ? { ...item, completed: !item.completed }
        : item
    );
    
    this.itemsSubject.next(newItems);
    
    console.log('✅ Observable emit - ÚJ referencia!');
    console.log('   → Parent CD fut');
    console.log('   → Observable emit-el ÚJ tömböt');
    console.log('   → Child OnPush frissül (új referencia)');
    console.log('   → Async pipe továbbítja az új referenciát!');
  }

  getCurrentStrategy(): string {
    return 'Parent: Default, Child: OnPush + Observable';
  }
}
