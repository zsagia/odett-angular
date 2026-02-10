import { Component, inject, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);

  protected readonly products = this.productService.products;
  protected readonly isLoading = this.productService.isLoading;
  protected readonly error = this.productService.error;
  protected readonly user = this.authService.user;

  protected readonly canEdit = computed(() => {
    const currentUser = this.user();
    return currentUser?.role === 'EDITOR' || currentUser?.role === 'ADMIN';
  });

  ngOnInit(): void {
    this.productService.getAll().subscribe();
  }

  deleteProduct(id: number): void {
    if (confirm('Biztosan torolni szeretned ezt a termeket?')) {
      this.productService.delete(id).subscribe();
    }
  }
}
