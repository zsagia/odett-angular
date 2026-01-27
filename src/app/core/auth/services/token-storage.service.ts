import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly EXPIRES_AT_KEY = 'expires_at';

  // Access token memory-ban tarolva (XSS vedelem)
  private readonly accessTokenInMemory = signal<string | null>(null);

  // Computed: van-e ervenyes token
  readonly hasValidToken = computed(() => {
    const token = this.accessTokenInMemory();
    const expiresAt = this.getExpiresAt();
    return !!token && Date.now() < expiresAt;
  });

  // Token mentes
  saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;

    // Access token csak memory-ban (XSS vedelem)
    this.accessTokenInMemory.set(accessToken);

    // Refresh token es lejarat localStorage-ban
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
  }

  getAccessToken(): string | null {
    return this.accessTokenInMemory();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getExpiresAt(): number {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : 0;
  }

  clearTokens(): void {
    this.accessTokenInMemory.set(null);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  // Token kozel van-e a lejarathoz (5 perc kueszob)
  isTokenExpiringSoon(): boolean {
    const expiresAt = this.getExpiresAt();
    const threshold = 5 * 60 * 1000; // 5 perc
    return Date.now() > expiresAt - threshold;
  }
}
