import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 403:
          // Forbidden - nincs jogosultsag
          console.error('Hozzaferes megtagadva:', error.message);
          break;
        case 404:
          // Not found
          console.error('Eroforras nem talalhato:', error.message);
          break;
        case 500:
          // Server error
          console.error('Szerver hiba:', error.message);
          break;
        case 0:
          // Network error
          console.error('Halozati hiba - ellenorizd hogy fut-e a backend szerver');
          break;
      }

      return throwError(() => error);
    })
  );
};
