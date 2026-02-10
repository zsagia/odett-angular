import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, switchMap, throwError, firstValueFrom } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import {
  AuthUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../models/auth.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly apiUrl = environment.apiUrl + '/auth';
  private readonly baseUrl = environment.apiUrl.replace('/api', ''); // http://localhost:8000

  // Allapot Signals-szel
  private readonly currentUser = signal<AuthUser | null>(null);
  private readonly loading = signal(false);
  private readonly authError = signal<string | null>(null);

  // Publikus readonly signals
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isLoading = this.loading.asReadonly();
  readonly error = this.authError.asReadonly();

  // Refresh token folyamatban flag
  private isRefreshing = false;

  /**
   * App indulaskor megnezi van-e refresh token a localStorage-ban.
   * Ha igen, megujitja a session-t (uj access token + user adat).
   */
  async initializeAuth(): Promise<void> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return;
    }

    try {
      await firstValueFrom(this.refreshToken());
    } catch {
      this.tokenStorage.clearTokens();
    }
  }

  /**
   * CSRF cookie lekerese a Sanctum-tol
   * Ez szukseges minden POST keres elott
   */
  private getCsrfCookie(): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loading.set(true);
    this.authError.set(null);

    // Eloszor CSRF cookie, majd login
    return this.getCsrfCookie().pipe(
      switchMap(() =>
        this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
          withCredentials: true
        })
      ),
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.loading.set(true);
    this.authError.set(null);

    // Eloszor CSRF cookie, majd register
    return this.getCsrfCookie().pipe(
      switchMap(() =>
        this.http.post<AuthResponse>(`${this.apiUrl}/register`, data, {
          withCredentials: true
        })
      ),
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  logout(): Observable<void> {
    const accessToken = this.tokenStorage.getAccessToken();

    if (!accessToken) {
      this.clearAuthState();
      return of(undefined);
    }

    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearAuthState()),
      catchError(() => {
        this.clearAuthState();
        return of(undefined);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken || this.isRefreshing) {
      return throwError(() => new Error('No refresh token or already refreshing'));
    }

    this.isRefreshing = true;

    return this.getCsrfCookie().pipe(
      switchMap(() =>
        this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {
          refresh_token: refreshToken
        }, { withCredentials: true })
      ),
      tap(response => {
        this.isRefreshing = false;
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.tokenStorage.clearTokens();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/user`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.tokenStorage.saveTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );
    this.currentUser.set(response.user);
    this.loading.set(false);
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.message || 'Ismeretlen hiba tortent.';
    this.authError.set(message);
    this.loading.set(false);
    return throwError(() => error);
  }

  private clearAuthState(): void {
    this.tokenStorage.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
