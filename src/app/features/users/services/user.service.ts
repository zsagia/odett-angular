import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/users';

  private readonly userList = signal<User[]>([]);
  private readonly loading = signal(false);
  private readonly userError = signal<string | null>(null);

  readonly users = this.userList.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly error = this.userError.asReadonly();

  getAll(): Observable<User[]> {
    this.loading.set(true);
    this.userError.set(null);

    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => {
        this.userList.set(users);
        this.loading.set(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  update(id: number, data: UpdateUserRequest): Observable<User> {
    this.loading.set(true);
    this.userError.set(null);

    return this.http.patch<User>(`${this.apiUrl}/${id}`, data, { withCredentials: true }).pipe(
      tap(updatedUser => {
        this.userList.update(users =>
          users.map(u => u.id === id ? updatedUser : u)
        );
        this.loading.set(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.message || 'Ismeretlen hiba tortent.';
    this.userError.set(message);
    this.loading.set(false);
    return throwError(() => error);
  }
}
