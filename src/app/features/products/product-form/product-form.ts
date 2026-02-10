import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink]
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isLoading = this.productService.isLoading;
  protected readonly error = this.productService.error;
  protected readonly isEditMode = signal(false);
  protected readonly productId = signal<number | null>(null);

  protected readonly productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    image_url: [''],
    category: [''],
    active: [true]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(Number(id));
      this.loadProduct(Number(id));
    }
  }

  private loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          image_url: product.image_url || '',
          category: product.category || '',
          active: product.active
        });
      },
      error: () => {
        this.router.navigate(['/products']);
      }
    });
  }

  protected onSubmit(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = this.productForm.value;

    if (this.isEditMode()) {
      this.productService.update(this.productId()!, formData).subscribe({
        next: () => this.router.navigate(['/products'])
      });
    } else {
      this.productService.create(formData).subscribe({
        next: () => this.router.navigate(['/products'])
      });
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  protected getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ez a mezo kotelezo.';
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} karakter engedetyezett.`;
    if (field.errors['min']) return 'Az ertek nem lehet negativ.';

    return '';
  }
}
