import { APP_INITIALIZER, ApplicationConfig, Injectable, inject, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/auth/services/auth.service';
import { provideTransloco, Translation, TranslocoLoader } from '@jsverse/transloco';
import { provideDemoAutopilot } from '@zssz-soft/demo-autopilot-core';
import { Observable, of } from 'rxjs';

import { routes } from './app.routes';
import { xsrfInterceptor } from './core/auth/interceptors/xsrf.interceptor';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { errorInterceptor } from './core/auth/interceptors/error.interceptor';
import { tutorialStepScripts } from './features/tutorial/scripts/tutorial-demo.script';

@Injectable({ providedIn: 'root' })
class NoopTranslocoLoader implements TranslocoLoader {
  getTranslation(_lang: string): Observable<Translation> {
    return of({});
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      // FONTOS: xsrfInterceptor ELSO helyen, hogy minden kereshez hozzaadja a CSRF tokent
      withInterceptors([xsrfInterceptor, authInterceptor, errorInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        return () => authService.initializeAuth();
      },
      multi: true
    },
    provideTransloco({
      config: {
        availableLangs: ['hu'],
        defaultLang: 'hu',
        prodMode: !isDevMode(),
        missingHandler: { logMissingKey: false }
      },
      loader: NoopTranslocoLoader
    }),
    provideDemoAutopilot({
      config: {
        debug: true,
        controlsPosition: 'bottom-right',
        defaultStepDelay: 1500,
        defaultCharDelay: 60
      },
      scripts: [
        ...tutorialStepScripts
      ]
    })
  ]
};
