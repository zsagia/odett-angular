import { HttpInterceptorFn } from '@angular/common/http';

/**
 * XSRF/CSRF token interceptor cross-origin keresekhez.
 * Az Angular beepitett XSRF kezelese csak same-origin kereseknel mukodik,
 * ezert manuálisan kell kezelni a cross-origin eseteket (pl. localhost:4200 -> localhost:8000).
 */
export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Csak POST, PUT, PATCH, DELETE keresekhez kell XSRF token
  const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  if (!isModifyingRequest) {
    return next(req);
  }

  // XSRF-TOKEN cookie kiolvasasa
  const xsrfToken = getCookie('XSRF-TOKEN');

  if (xsrfToken) {
    // Token hozzaadasa headerhez
    const clonedReq = req.clone({
      setHeaders: {
        'X-XSRF-TOKEN': xsrfToken
      }
    });
    return next(clonedReq);
  }

  return next(req);
};

/**
 * Cookie ertek kiolvasasa nev alapjan
 */
function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      // URL decode szukseges, mert a Laravel URL-kodolva kuldi
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
}
