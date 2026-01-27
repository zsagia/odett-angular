import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { xsrfInterceptor } from './core/auth/interceptors/xsrf.interceptor';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { errorInterceptor } from './core/auth/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      // FONTOS: xsrfInterceptor ELSO helyen, hogy minden kereshez hozzaadja a CSRF tokent
      withInterceptors([xsrfInterceptor, authInterceptor, errorInterceptor])
    )
  ]
};
