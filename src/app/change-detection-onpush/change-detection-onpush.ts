import { Component, ChangeDetectionStrategy, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemList } from '../item-list/item-list';

interface Item {
  id: number;
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-change-detection-onpush',
  imports: [CommonModule, ItemList],
  templateUrl: './change-detection-onpush.html',
  styleUrl: './change-detection-onpush.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChangeDetectionOnPush implements DoCheck {
  items: Item[] = [
    { id: 1, name: 'Tanulás Angular-ból', completed: false },
    { id: 2, name: 'Házi feladat megírása', completed: false },
    { id: 3, name: 'Kód review', completed: true }
  ];

  renderCount = 0;

  ngDoCheck() {
    this.renderCount++;
    console.log('🔄 Parent (Default) - Komponens ÚJRA RENDERELŐDÖTT!', this.renderCount);
  }

  // ❌ Mutates object - won't render with OnPush
  mutateItem() {
    const firstItem = this.items[0];
    firstItem.completed = !firstItem.completed;
    console.log('❌ Mutáció: items tömb referenciája NEM változott');
    console.log('   → Parent CD fut → Parent számláló UI-ban nő');
    console.log('   → Child ngDoCheck fut → Child számláló változó nő');
    console.log('   → DE! Child template NEM frissül → Child számláló UI-ban NEM nő!');
    console.log('   → Figyeld: Child számláló a képernyőn nem változik!');
  }

  // ✅ Creates new reference - will render
  updateImmutable() {
    this.items = this.items.map((item, index) => 
      index === 0 
        ? { ...item, completed: !item.completed }
        : item
    );
    console.log('✅ Immutable: ÚJ items tömb referencia');
    console.log('   → Parent CD fut → Parent számláló UI-ban nő');
    console.log('   → Child ngDoCheck fut → Child számláló változó nő');
    console.log('   → ÉS! Child template IS frissül → Child számláló UI-ban IS nő!');
    console.log('   → Figyeld: Child számláló a képernyőn is növekszik!');
  }

  getCurrentStrategy(): string {
    return 'Parent: Default, Child: OnPush';
  }
}
