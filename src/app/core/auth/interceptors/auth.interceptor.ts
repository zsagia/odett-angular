import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  // Ezekhez az URL-ekhez nem kell token
  const excludedUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
  const isExcluded = excludedUrls.some(url => req.url.includes(url));

  if (isExcluded) {
    return next(req);
  }

  const accessToken = tokenStorage.getAccessToken();

  // Token hozzaadasa ha letezik
  let authReq = req;
  if (accessToken) {
    authReq = addTokenToRequest(req, accessToken);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized - probaljuk frissiteni a tokent
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            const newReq = addTokenToRequest(req, response.access_token);
            return next(newReq);
          }),
          catchError(refreshError => {
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
