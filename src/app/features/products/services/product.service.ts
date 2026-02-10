import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/products';

  private readonly productList = signal<Product[]>([]);
  private readonly loading = signal(false);
  private readonly productError = signal<string | null>(null);

  readonly products = this.productList.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly error = this.productError.asReadonly();

  getAll(): Observable<Product[]> {
    this.loading.set(true);
    this.productError.set(null);

    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => {
        this.productList.set(products);
        this.loading.set(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  getById(id: number): Observable<Product> {
    this.loading.set(true);
    this.productError.set(null);

    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => this.handleError(error))
    );
  }

  create(product: CreateProductRequest): Observable<Product> {
    this.loading.set(true);
    this.productError.set(null);

    return this.http.post<Product>(this.apiUrl, product, { withCredentials: true }).pipe(
      tap(newProduct => {
        this.productList.update(products => [...products, newProduct]);
        this.loading.set(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  update(id: number, product: UpdateProductRequest): Observable<Product> {
    this.loading.set(true);
    this.productError.set(null);

    return this.http.patch<Product>(`${this.apiUrl}/${id}`, product, { withCredentials: true }).pipe(
      tap(updatedProduct => {
        this.productList.update(products =>
          products.map(p => p.id === id ? updatedProduct : p)
        );
        this.loading.set(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  delete(id: number): Observable<{ message: string }> {
    this.loading.set(true);
    this.productError.set(null);

    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this.productList.update(products => products.filter(p => p.id !== id));
        this.loading.set(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.message || 'Ismeretlen hiba tortent.';
    this.productError.set(message);
    this.loading.set(false);
    return throwError(() => error);
  }
}
