import { DemoScript } from '@zssz-soft/demo-autopilot-core';

export const loginDemoScript: DemoScript = {
  id: 'login-demo',
  name: 'Bejelentkezés oldal',
  description: 'A login oldal felépítése: Reactive Forms, validáció, CSRF védelem és AuthService hívás.',
  category: 'auth',
  tags: ['login', 'form', 'csrf', 'angular'],

  setup: {
    initialRoute: '/login'
  },

  steps: [
    {
      id: 'login-card',
      label: 'Bejelentkezési űrlap',
      action: { type: 'highlight', selector: '.login-card' },
      tooltip: {
        title: 'Bejelentkezési űrlap',
        content: 'Ez egy Angular Reactive Form. A FormBuilder definiálja a mezőket és a validátorokat. A formGroup direktíva köti össze a template-et a TypeScript kóddal.',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '.login-card',
        padding: 12,
        scrollIntoView: true
      }
    },
    {
      id: 'email-field',
      label: 'Email mező',
      action: { type: 'highlight', selector: '#email' },
      tooltip: {
        title: 'Email mező (formControlName)',
        content: 'A formControlName="email" direktíva köti a mezőt a FormGroup email vezérlőjéhez.\n\nValidátorok:\n• Validators.required – kötelező mező\n• Validators.email – érvényes email formátum\n\nHa invalid és touched → megjelenik a hibaüzenet.',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '#email',
        padding: 4
      }
    },
    {
      id: 'password-field',
      label: 'Jelszó mező',
      action: { type: 'highlight', selector: '#password' },
      tooltip: {
        title: 'Jelszó mező',
        content: 'A type="password" elrejti a beírt karaktereket.\n\nValidátorok:\n• Validators.required – kötelező\n• Validators.minLength(8) – minimum 8 karakter\n\nAz autocomplete="current-password" segíti a böngésző jelszókezelőjét.',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '#password',
        padding: 4
      }
    },
    {
      id: 'submit-btn',
      label: 'Bejelentkezés gomb',
      action: { type: 'highlight', selector: '.submit-btn' },
      tooltip: {
        title: 'Submit gomb – mi történik kattintáskor?',
        content: '1. Az onSubmit() ellenőrzi a form érvényességét\n2. Ha invalid → markAsTouched() minden mezőre\n3. Ha valid → AuthService.login() hívás:\n   a) GET /sanctum/csrf-cookie (CSRF token)\n   b) POST /api/auth/login (email + jelszó)\n4. A szerver visszaküldi a JWT tokent\n5. TokenStorageService elmenti a memóriába\n6. Router átirányít a /home oldalra',
        position: 'top',
        requireConfirm: true
      },
      highlight: {
        selector: '.submit-btn',
        padding: 6
      }
    },
    {
      id: 'register-link',
      label: 'Regisztráció link',
      action: { type: 'highlight', selector: '.register-link' },
      tooltip: {
        title: 'Navigáció a regisztrációhoz',
        content: 'A routerLink="/register" direktíva az Angular Routerrel navigál a regisztrációs oldalra. Mindkét oldalt a guestGuard védi: csak NEM bejelentkezett felhasználók láthatják.',
        position: 'top',
        requireConfirm: true
      },
      highlight: {
        selector: '.register-link',
        padding: 6
      }
    }
  ]
};
