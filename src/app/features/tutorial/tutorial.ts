import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AutopilotService } from '@zssz-soft/demo-autopilot-core';
import { Subscription } from 'rxjs';
import { EventSequenceComponent, EventSequenceData } from './components/event-sequence';

interface CodeBlock {
  label: string;
  language: 'typescript' | 'php' | 'html';
  code: string;
}

interface TabDefinition {
  label: string;
}

interface Section {
  content: string;
  label?: string;
  labelType?: 'defense' | 'attack' | 'info';
  codeBlocks?: CodeBlock[];
  tab?: number;
  diagramData?: EventSequenceData;
}

interface Step {
  title: string;
  side: 'client' | 'server' | 'both';
  sections: Section[];
  tabs?: TabDefinition[];
}

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventSequenceComponent]
})
export class TutorialComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly autopilot = inject(AutopilotService);
  private paramSub?: Subscription;

  protected readonly activeStep = signal(0);
  protected readonly activeTab = signal(0);
  protected readonly tutorialScripts = this.autopilot.getScripts().filter(s => s.category === 'tutorial-step');
  protected readonly pageScripts = this.autopilot.getScripts().filter(s => s.category !== 'tutorial-step');

  protected readonly introSections = computed(() => {
    const step = this.steps[this.activeStep()];
    if (!step.tabs) return [];
    return step.sections.filter(s => s.tab === undefined);
  });

  protected readonly visibleSections = computed(() => {
    const step = this.steps[this.activeStep()];
    if (!step.tabs) return step.sections;
    const tab = this.activeTab();
    return step.sections.filter(s => s.tab === tab);
  });

  protected readonly steps: Step[] = [
    // ═══════════════════════════════════════════════════
    // 1. Mi az a JWT?
    // ═══════════════════════════════════════════════════
    {
      title: '1. Mi az a JWT?',
      side: 'both',
      sections: [
        {
          content: `A JSON Web Token (JWT) egy nyílt szabvány (RFC 7519), amely biztonságos módon továbbít információt két fél között JSON objektumként. A token digitálisan aláírt, ezért megbízható és ellenőrizhető.

Egy JWT három részből áll, ponttal (.) elválasztva:`
        },
        {
          content: `HEADER (Fejléc):
Az algoritmus típusát és a token típusát tartalmazza. A mi projektünkben a Laravel Sanctum HS256 algoritmust használ, ami HMAC-SHA256 alapú szimmetrikus titkosítás. Ez azt jelenti, hogy ugyanaz a titkos kulcs (APP_KEY a .env fájlban) szolgál az aláíráshoz és az ellenőrzéshez is.`
        },
        {
          content: `PAYLOAD (Hasznos teher):
A „claims" mezőket tartalmazza – ezek az adatok, amelyeket a token hordoz:
  • sub (subject) – a felhasználó egyedi azonosítója (user id)
  • iat (issued at) – a token kiállításának időpontja (Unix timestamp)
  • exp (expiration) – a token lejáratának időpontja
  • Egyedi mezők – a mi esetünkben: name, email, role`
        },
        {
          content: `SIGNATURE (Aláírás):
A header és payload Base64URL kódolt összefűzéséből képzett HMAC-SHA256 hash, a szerver titkos kulcsával. Ha bárki módosítja a payload-ot (pl. átírja a role mezőt ADMIN-ra), az aláírás érvénytelen lesz és a szerver elutasítja.

Felépítés: eyJ<Header>.eyJ<Payload>.<Signature>`
        },
        {
          content: `A projektünkben a szerver (Laravel Sanctum) generálja a JWT-t bejelentkezéskor, és a válaszban visszaküldi a kliensnek. Az Angular kliens eltárolja és minden API kéréshez automatikusan mellékeli az Authorization headerben.`,
          codeBlocks: [
            {
              label: 'Angular – auth.models.ts (Interfészek)',
              language: 'typescript',
              code: `// Bejelentkezési kérés – ezt küldi a kliens a szervernek
export interface LoginRequest {
  email: string;      // A felhasználó email címe
  password: string;   // A jelszó (plain text – HTTPS-en titkosítva utazik)
}

// Regisztrációs kérés – új felhasználó létrehozásához
export interface RegisterRequest {
  name: string;                    // Felhasználó neve
  email: string;                   // Email cím (egyedi kell legyen)
  password: string;                // Jelszó (min. 8 karakter)
  password_confirmation: string;   // Jelszó megerősítés (meg kell egyeznie)
}

// A bejelentkezett felhasználó adatai
export interface AuthUser {
  id: number;                              // Egyedi azonosító (sub claim)
  name: string;                            // Felhasználó neve
  email: string;                           // Email cím
  role: 'USER' | 'EDITOR' | 'ADMIN';      // Szerepkör – jogosultságkezeléshez
  email_verified_at: string | null;        // Email megerősítés időpontja
  created_at: string;                      // Regisztráció időpontja
  updated_at: string;                      // Utolsó módosítás
}

// A szerver válasza sikeres bejelentkezés/regisztráció után
export interface AuthResponse {
  user: AuthUser;          // A felhasználó objektum
  access_token: string;    // JWT – ezt küldjük minden API kérésben
  refresh_token: string;   // Hosszú életű token – ezzel frissítjük az access tokent
  token_type: string;      // Mindig "Bearer" – az Authorization header formátuma
  expires_in: number;      // Access token lejárat másodpercben (3600 = 60 perc)
}`
            }
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // 2. Regisztráció folyamata
    // ═══════════════════════════════════════════════════
    {
      title: '2. Regisztráció folyamata',
      side: 'both',
      sections: [
        {
          content: `A regisztráció az a folyamat, amikor egy új felhasználó fiókot hoz létre. A teljes folyamat a kliens és szerver között zajlik.`
        },
        {
          content: `KLIENS OLDAL (Angular):

1. A felhasználó megnyitja a /register oldalt
   → A guestGuard ellenőrzi, hogy nincs-e már bejelentkezve
   → Ha igen, átirányít a /home-ra

2. Kitölti a regisztrációs űrlapot (Reactive Form)
   → A FormBuilder 4 mezőt definiál: name, email, password, password_confirmation
   → Minden mezőhöz Validators vannak rendelve:
     • name: kötelező + minimum 3 karakter
     • email: kötelező + érvényes email formátum
     • password: kötelező + minimum 8 karakter
     • password_confirmation: kötelező
   → Van egy form-szintű custom validator (passwordMatchValidator) ami ellenőrzi, hogy a két jelszó megegyezik-e`,
          codeBlocks: [
            {
              label: 'Angular – register.ts (Regisztrációs komponens)',
              language: 'typescript',
              code: `export class RegisterComponent {
  // Angular 21: inject() függvénnyel kérjük a szolgáltatásokat
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signal-ek közvetlenül az AuthService-ből
  protected readonly isLoading = this.authService.isLoading;
  protected readonly error = this.authService.error;

  // Reactive Form definíció validátorokkal
  protected readonly registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  // Custom validátor: jelszó egyezés ellenőrzése
  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');
    if (password && confirmPassword
        && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      // Minden mezőt touched-re állítjuk → hibák megjelennek
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }
    this.authService.register(this.registerForm.value).subscribe({
      next: () => this.router.navigate(['/home'])
    });
  }
}`
            }
          ]
        },
        {
          content: `3. A Submit gomb megnyomásakor az onSubmit() fut le
   → Ha invalid: az összes mezőt „touched" állapotra állítja → hibaüzenetek megjelennek
   → Ha valid: meghívja az AuthService.register() metódust

4. Az AuthService.register() két HTTP kérést küld (pipe + switchMap):
   → Először: GET /sanctum/csrf-cookie – CSRF token lekérése
   → Majd: POST /api/auth/register – a form adatok elküldése
   → withCredentials: true → a böngésző elküldi a cookie-kat cross-origin kérésnél`,
          codeBlocks: [
            {
              label: 'Angular – auth.service.ts (Register metódus)',
              language: 'typescript',
              code: `register(data: RegisterRequest): Observable<AuthResponse> {
  this.loading.set(true);       // loading signal bekapcsolása
  this.authError.set(null);     // korábbi hiba törlése

  // pipe() + switchMap(): két HTTP kérés láncolása
  return this.getCsrfCookie().pipe(
    // 1. GET /sanctum/csrf-cookie – CSRF token lekérése
    switchMap(() =>
      // 2. POST /api/auth/register – adatok küldése
      this.http.post<AuthResponse>(
        \`\${this.apiUrl}/register\`, data,
        { withCredentials: true }  // Cookie-k engedélyezése
      )
    ),
    // 3. Siker: tokenek mentése + user signal frissítése
    tap(response => this.handleAuthSuccess(response)),
    // 4. Hiba: hibaüzenet signal beállítása
    catchError(error => this.handleAuthError(error))
  );
}

// CSRF cookie lekérése – kötelező minden POST/PUT/DELETE előtt
private getCsrfCookie(): Observable<void> {
  return this.http.get<void>(
    \`\${this.baseUrl}/sanctum/csrf-cookie\`,
    { withCredentials: true }
  );
}

// Sikeres autentikáció kezelése
private handleAuthSuccess(response: AuthResponse): void {
  this.tokenStorage.saveTokens(
    response.access_token,   // → memóriába (signal)
    response.refresh_token,  // → localStorage-ba
    response.expires_in      // → lejárat kiszámítása
  );
  this.currentUser.set(response.user);  // User signal frissítése
  this.loading.set(false);
}`
            }
          ]
        },
        {
          content: `SZERVER OLDAL (Laravel):

5. A RegisterRequest validálja az adatokat
   → Ha sikertelen → 422 Unprocessable Entity válasz

6. Jelszó hash-elése bcrypt-tel
   → Egyirányú hash: a jelszó nem fejthető vissza
   → Minden hash-hez egyedi „salt" generálódik

7. Felhasználó létrehozása a users táblában (alapértelmezett role: USER)`
        },
        {
          content: `8. Token pár generálása
   → Access token: Sanctum createToken() (60 perc lejárat)
   → Refresh token: 64 karakter string, SHA-256 hash-elve mentve (7 nap lejárat)

9. JSON válasz: { user, access_token, refresh_token, token_type, expires_in }`
        },
        {
          content: `KLIENS OLDAL – válasz feldolgozása:

10. A handleAuthSuccess() metódus:
    → Access tokent memóriába menti (signal)
    → Refresh tokent localStorage-ba menti
    → A currentUser signal-t beállítja
    → Átirányít a /home oldalra`
        },
        {
          content: `ESEMÉNY SZEKVENCIA – a regisztráció teljes folyamata vizuálisan:`,
          diagramData: {
            participants: ['Register', 'AuthService', 'TokenStorage', 'Laravel'],
            events: [
              { id: 'r1', type: 'lifecycle', source: 'Register', eventName: 'form submit' },
              { id: 'r2', type: 'emission', source: 'Register', target: 'AuthService', eventName: 'register()' },
              { id: 'r3', type: 'handling', source: 'AuthService', eventName: 'register()' },
              { id: 'r4', type: 'emission', source: 'AuthService', target: 'Laravel', eventName: 'GET /csrf-cookie' },
              { id: 'r5', type: 'handling', source: 'Laravel', target: 'AuthService', eventName: 'Set-Cookie: XSRF' },
              { id: 'r6', type: 'emission', source: 'AuthService', target: 'Laravel', eventName: 'POST /register' },
              { id: 'r7', type: 'lifecycle', source: 'Laravel', eventName: 'validate + hash' },
              { id: 'r8', type: 'handling', source: 'Laravel', target: 'AuthService', eventName: '{ user, tokens }' },
              { id: 'r9', type: 'emission', source: 'AuthService', target: 'TokenStorage', eventName: 'saveTokens()' },
              { id: 'r10', type: 'handling', source: 'TokenStorage', eventName: 'access→signal, refresh→ls' },
              { id: 'r11', type: 'lifecycle', source: 'AuthService', eventName: "navigate('/home')" },
            ]
          }
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // 3. Bejelentkezés folyamata
    // ═══════════════════════════════════════════════════
    {
      title: '3. Bejelentkezés folyamata',
      side: 'both',
      sections: [
        {
          content: `A bejelentkezés a meglévő felhasználó hitelesítése email és jelszó alapján.`
        },
        {
          content: `KLIENS OLDAL (Angular):

1. A felhasználó megnyitja a /login oldalt
   → A guestGuard ellenőrzi: ha be van jelentkezve → /home-ra irányít

2. A LoginComponent Reactive Form-ot használ két mezővel:
   → email: kötelező + érvényes email formátum
   → password: kötelező + minimum 8 karakter
   → Az isLoading és error signal-ek az AuthService-ből jönnek`,
          codeBlocks: [
            {
              label: 'Angular – login.ts (Bejelentkezési komponens)',
              language: 'typescript',
              code: `export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signal-ek az AuthService-ből – a template automatikusan frissül
  protected readonly isLoading = this.authService.isLoading;
  protected readonly error = this.authService.error;

  // Reactive Form – két mezővel
  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Ha authGuard irányított ide → visszanavigálás
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigate([returnUrl]);
      }
    });
  }
}`
            }
          ]
        },
        {
          content: `3. Az onSubmit() metódus:
   → Ha invalid: markAsTouched() minden mezőre → hibaüzenetek megjelennek
   → Ha valid: AuthService.login() hívás a { email, password } objektummal
   → Siker esetén: a returnUrl query paraméterből olvassa ki a céloldalt
   → Ez azért fontos, mert ha az authGuard irányította ide a felhasználót,
     akkor bejelentkezés után visszanavigáljon az eredeti oldalra`,
          codeBlocks: [
            {
              label: 'Angular – login.html (Template)',
              language: 'html',
              code: `<!-- Hibaüzenet – az error() signal értéke -->
@if (error()) {
  <div class="error-message" role="alert">
    {{ error() }}
  </div>
}

<!-- Reactive Form – formGroup köti össze a TS-ben definiált form-mal -->
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <label for="email">Email cím</label>
    <input
      type="email" id="email"
      formControlName="email"
      [class.invalid]="isFieldInvalid('email')"
      autocomplete="email"
    />
    <!-- Mező szintű hiba – csak touched + invalid esetén jelenik meg -->
    @if (isFieldInvalid('email')) {
      <span class="field-error">{{ getFieldError('email') }}</span>
    }
  </div>

  <!-- Submit gomb – disabled amíg isLoading() signal true -->
  <button type="submit" [disabled]="isLoading()">
    @if (isLoading()) {
      <span>Bejelentkezés...</span>
    } @else {
      <span>Bejelentkezés</span>
    }
  </button>
</form>`
            }
          ]
        },
        {
          content: `4. Az AuthService.login() RxJS pipe-ban:
   → getCsrfCookie(): GET /sanctum/csrf-cookie
   → switchMap(): POST /api/auth/login (email + jelszó)
   → tap(): handleAuthSuccess() – tokenek mentése
   → catchError(): handleAuthError() – hibaüzenet beállítása`,
          codeBlocks: [
            {
              label: 'Angular – auth.service.ts (Login metódus)',
              language: 'typescript',
              code: `login(credentials: LoginRequest): Observable<AuthResponse> {
  this.loading.set(true);      // loading → true (gomb disabled)
  this.authError.set(null);    // előző hiba törlése

  return this.getCsrfCookie().pipe(
    // 1. CSRF cookie lekérése
    switchMap(() =>
      // 2. POST /api/auth/login kérés küldése
      this.http.post<AuthResponse>(
        \`\${this.apiUrl}/login\`, credentials,
        { withCredentials: true }
      )
    ),
    // 3. Siker: tokenek mentése + user signal frissítés
    tap(response => this.handleAuthSuccess(response)),
    // 4. Hiba: error signal frissítése
    catchError(error => this.handleAuthError(error))
  );
}`
            }
          ]
        },
        {
          content: `SZERVER OLDAL (Laravel):

5. A LoginRequest validálja: email (required, email) és password (required, string)

6. Felhasználó keresése email alapján:
   → User::where('email', $request->email)->first()

7. Jelszó ellenőrzés Hash::check()-kel:
   → Összehasonlítja a plain text jelszót a bcrypt hash-sel
   → Ha nem egyezik → ValidationException('Hibás email vagy jelszó')
   → Fontos: nem áruljuk el, melyik volt rossz (biztonsági ok!)

8. Token generálás és válasz:
   → Access token (JWT, 60 perc) + Refresh token (7 nap)
   → JSON válasz: { user, access_token, refresh_token, token_type, expires_in }`
        },
        {
          content: `ESEMÉNY SZEKVENCIA – a bejelentkezés teljes folyamata vizuálisan:`,
          diagramData: {
            participants: ['Login', 'AuthService', 'TokenStorage', 'Laravel'],
            events: [
              { id: 'l1', type: 'lifecycle', source: 'Login', eventName: 'form submit' },
              { id: 'l2', type: 'emission', source: 'Login', target: 'AuthService', eventName: 'login()' },
              { id: 'l3', type: 'handling', source: 'AuthService', eventName: 'login()' },
              { id: 'l4', type: 'emission', source: 'AuthService', target: 'Laravel', eventName: 'GET /csrf-cookie' },
              { id: 'l5', type: 'handling', source: 'Laravel', target: 'AuthService', eventName: 'Set-Cookie: XSRF' },
              { id: 'l6', type: 'emission', source: 'AuthService', target: 'Laravel', eventName: 'POST /login' },
              { id: 'l7', type: 'lifecycle', source: 'Laravel', eventName: 'Hash::check()' },
              { id: 'l8', type: 'handling', source: 'Laravel', target: 'AuthService', eventName: '{ user, tokens }' },
              { id: 'l9', type: 'emission', source: 'AuthService', target: 'TokenStorage', eventName: 'saveTokens()' },
              { id: 'l10', type: 'handling', source: 'TokenStorage', eventName: 'access→signal, refresh→ls' },
              { id: 'l11', type: 'lifecycle', source: 'AuthService', eventName: "navigate('/home')" },
            ]
          }
        }
      ],
    },

    // ═══════════════════════════════════════════════════
    // 4. Token tárolás stratégia
    // ═══════════════════════════════════════════════════
    {
      title: '4. Token tárolás stratégia',
      side: 'client',
      sections: [
        {
          content: `A tokenek biztonságos tárolása az egyik legfontosabb döntés JWT rendszerben. Két különböző helyen tároljuk a két tokent:`
        },
        {
          content: `ACCESS TOKEN (rövid életű, 60 perc):
  → Memóriában tároljuk Angular signal-ben (NEM localStorage-ban!)
  → Minden API kéréshez csatoljuk az Authorization headerben
  → Ha az oldal újratöltődik (F5), az access token elvész
  → Ezért kell a refresh token: újratöltéskor automatikusan újat kérünk
  → Signal-ben tároljuk: a TokenStorageService accessTokenInMemory signal-t használ
  → A signal() reaktív: a template és computed() azonnal látja a változást`,
          codeBlocks: [
            {
              label: 'Angular – token-storage.service.ts (Teljes kód)',
              language: 'typescript',
              code: `@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  // localStorage kulcsok konstansként
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly EXPIRES_AT_KEY = 'expires_at';

  // Access token MEMÓRIÁBAN signal-ben (XSS védelem!)
  // Oldal újratöltésekor null → refresh token kell
  private readonly accessTokenInMemory = signal<string | null>(null);

  // Computed signal: van-e érvényes (nem lejárt) access token
  readonly hasValidToken = computed(() => {
    const token = this.accessTokenInMemory();
    const expiresAt = this.getExpiresAt();
    return !!token && Date.now() < expiresAt;
  });

  // Token pár mentése bejelentkezés/regisztráció után
  saveTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number       // másodpercben (pl. 3600 = 60 perc)
  ): void {
    const expiresAt = Date.now() + expiresIn * 1000;

    // Access token → memória (signal)
    this.accessTokenInMemory.set(accessToken);

    // Refresh token + lejárat → localStorage
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
  }

  // Access token kiolvasása memóriából
  getAccessToken(): string | null {
    return this.accessTokenInMemory();
  }

  // Refresh token kiolvasása localStorage-ból
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Lejárati idő (milliszekundum timestamp)
  getExpiresAt(): number {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : 0;
  }

  // Összes token törlése (kijelentkezéskor)
  clearTokens(): void {
    this.accessTokenInMemory.set(null);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  // Közel van-e a lejárathoz? (5 perces küszöb)
  isTokenExpiringSoon(): boolean {
    const expiresAt = this.getExpiresAt();
    const threshold = 5 * 60 * 1000; // 5 perc ms-ban
    return Date.now() > expiresAt - threshold;
  }
}`
            }
          ]
        },
        {
          content: `REFRESH TOKEN (hosszú életű, 7 nap):
  → localStorage-ban tároljuk (túléli az oldal újratöltést)
  → Kizárólag token frissítéshez használjuk (POST /api/auth/refresh)
  → A szerveren SHA-256 hash-elve van tárolva
  → Egyszeri használatú: frissítéskor új refresh tokent is kapunk (token rotation)`
        },
        {
          content: `LEJÁRAT KEZELÉSE:
  → Az expires_in értékből kiszámítjuk a lejárati időpontot (Date.now() + expires_in * 1000)
  → localStorage-ban tároljuk „expires_at" kulcs alatt
  → Az isTokenExpiringSoon() metódus 5 perces küszöbbel figyeli
  → A hasValidToken computed signal automatikusan false-ra vált ha lejárt`
        },
        {
          content: `MIÉRT NEM LOCALSTORAGE AZ ACCESS TOKEN?
  → XSS (Cross-Site Scripting) támadás esetén a localStorage kiolvasható
  → A memóriában tárolt token XSS esetén nehezebben hozzáférhető
  → A refresh token localStorage-ban van, de az csak frissítésre használható`
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // 5. Auth Interceptor
    // ═══════════════════════════════════════════════════
    {
      title: '5. Auth Interceptor – automatikus token csatolás',
      side: 'client',
      sections: [
        {
          content: `Az Angular HTTP interceptor egy köztes réteg, amely minden kimenő HTTP kérést elfog és módosíthat. A mi auth interceptorunk automatikusan hozzáadja a JWT tokent az API kérésekhez.

MIÉRT INTERCEPTOR?
  → Nem kell minden HTTP hívásban kézzel beállítani az Authorization headert
  → Egyetlen helyen, centralizáltan kezeljük a token csatolást
  → A szolgáltatásoknak (ProductService, UserService) nem kell tudniuk a tokenről`,
          codeBlocks: [
            {
              label: 'Angular – auth.interceptor.ts (Teljes kód)',
              language: 'typescript',
              code: `// HttpInterceptorFn: funkcionális interceptor (Angular 21 ajánlás)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  // Ezekhez NEM kell Bearer token (a refresh-hez KELL!)
  const excludedUrls = [
    '/auth/login', '/auth/register'
  ];
  const isExcluded = excludedUrls.some(
    url => req.url.includes(url)
  );

  if (isExcluded) {
    return next(req);  // Változtatás nélkül továbbítjuk
  }

  // Access token lekérése a memóriából
  const accessToken = tokenStorage.getAccessToken();

  // Ha van token → hozzáadjuk a kéréshez
  let authReq = req;
  if (accessToken) {
    authReq = addTokenToRequest(req, accessToken);
  }

  // Kérés küldése + hibakezelés
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 → token lejárt, próbáljuk frissíteni
      if (error.status === 401
          && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          // Sikeres refresh → kérés újraküldése új tokennel
          switchMap(response => {
            const newReq = addTokenToRequest(
              req, response.access_token
            );
            return next(newReq);
          }),
          // Refresh is sikertelen → hiba továbbdobása
          catchError(refreshError =>
            throwError(() => refreshError)
          )
        );
      }
      return throwError(() => error);
    })
  );
};

// Segédfüggvény: token hozzáadása a kéréshez
// req.clone() → új kérés (immutable pattern)
function addTokenToRequest(
  req: HttpRequest<unknown>, token: string
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: \`Bearer \${token}\`
    }
  });
}`
            }
          ]
        },
        {
          content: `KIZÁRT URL-EK:
  → A login és register végpontokhoz NEM kell token
  → A refresh végponthoz KELL token (a szerver ellenőrzi a Bearer tokent is)
  → Az „excludedUrls" tömbben a login és register van felsorolva
  → Ha a kérés URL-je tartalmazza valamelyiket, továbbengedi módosítás nélkül`
        },
        {
          content: `TOKEN CSATOLÁS:
  → TokenStorageService-ből lekéri az access tokent (memóriából)
  → Ha van token → klónozza a kérést és hozzáadja: Authorization: Bearer <token>
  → req.clone() szükséges, mert a HttpRequest immutable (nem módosítható)`
        },
        {
          content: `401 UNAUTHORIZED KEZELÉS:
  → Ha a szerver 401-et küld (lejárt token), automatikusan megpróbálja frissíteni
  → Meghívja az AuthService.refreshToken() metódust
  → Ha sikeres → az eredeti kérést újraküldi az új tokennel
  → Ha a refresh is sikertelen → a hiba továbbdobódik
  → A /auth/refresh URL-re érkező 401-et NEM próbálja újra (végtelen ciklus elkerülése!)`
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // 6. CSRF védelem
    // ═══════════════════════════════════════════════════
    {
      title: '6. CSRF védelem',
      side: 'both',
      sections: [
        {
          content: `A CSRF (Cross-Site Request Forgery) egy támadási forma, ahol egy rosszindulatú weboldal a felhasználó nevében küld kéréseket a szerverünknek.`
        },
        {
          content: `PÉLDA TÁMADÁS:
  → A felhasználó bejelentkezik az alkalmazásunkba (cookie-k beállítódnak)
  → Egy másik tab-on megnyit egy rosszindulatú oldalt
  → Az oldal egy rejtett form-mal POST kérést küld a mi /api/products végpontunkra
  → A böngésző automatikusan mellékeli a cookie-kat → a szerver azt hiszi, jogos kérés`
        },
        {
          content: `HOGYAN VÉDEKEZÜNK?
  → A Laravel Sanctum beállít egy XSRF-TOKEN cookie-t a /sanctum/csrf-cookie végponton
  → A kliens kiolvassa ezt a cookie-t és X-XSRF-TOKEN headerként visszaküldi
  → A szerver összehasonlítja a cookie és a header értékét
  → Ha nem egyeznek → 419 CSRF Token Mismatch hiba
  → A rosszindulatú oldal NEM tudja kiolvasni a mi domain cookie-jainkat (Same-Origin Policy)`,
          codeBlocks: [
            {
              label: 'Angular – xsrf.interceptor.ts (Teljes kód)',
              language: 'typescript',
              code: `// Custom XSRF interceptor – szükséges cross-origin kéréseknél
export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Csak módosító kérésekhez kell CSRF token
  const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE']
    .includes(req.method);

  if (!isModifyingRequest) {
    return next(req);  // GET kérés → nincs CSRF szükség
  }

  // XSRF-TOKEN cookie kiolvasása
  const xsrfToken = getCookie('XSRF-TOKEN');

  if (xsrfToken) {
    // Token hozzáadása headerként
    const clonedReq = req.clone({
      setHeaders: {
        'X-XSRF-TOKEN': xsrfToken
      }
    });
    return next(clonedReq);
  }

  return next(req);
};

// Cookie érték kiolvasása név alapján
function getCookie(name: string): string | null {
  // document.cookie formátuma: "name1=value1; name2=value2"
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      // URL decode – a Laravel URL-kódolva küldi
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}`
            }
          ]
        },
        {
          content: `MIÉRT KELL EGYEDI INTERCEPTOR?
  → Az Angular beépített HttpClientXsrfModule csak same-origin kéréseknél működik
  → Nálunk a frontend (localhost:4200) és backend (localhost:8000) különböző porton fut
  → Ez cross-origin kérés → az Angular beépített XSRF kezelése nem működik
  → Ezért írtunk custom xsrfInterceptor-t`,
          codeBlocks: [
            {
              label: 'Angular – auth.service.ts (CSRF cookie lekérés)',
              language: 'typescript',
              code: `// Minden módosító kérés előtt le kell kérni a CSRF cookie-t
private getCsrfCookie(): Observable<void> {
  return this.http.get<void>(
    // baseUrl = http://localhost:8000
    \`\${this.baseUrl}/sanctum/csrf-cookie\`,
    { withCredentials: true }  // FONTOS: enélkül nem állítódik be!
  );
}

// Használata a login()-ban:
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.getCsrfCookie().pipe(       // 1. CSRF cookie
    switchMap(() =>                         // 2. Ha megvan...
      this.http.post<AuthResponse>(        // 3. POST kérés
        \`\${this.apiUrl}/login\`, credentials,
        { withCredentials: true }
      )
      // A xsrfInterceptor automatikusan hozzáadja
      // az X-XSRF-TOKEN headert a POST kéréshez
    )
  );
}`
            }
          ]
        },
        {
          content: `INTERCEPTOR MŰKÖDÉSE:
  → Csak módosító kérésekhez fut (POST, PUT, PATCH, DELETE) – GET nem igényel CSRF védelmet
  → Kiolvassa az XSRF-TOKEN cookie-t a document.cookie-ból
  → URL-dekódolja (a Laravel URL-kódolva küldi)
  → Hozzáadja X-XSRF-TOKEN headerként a kéréshez`
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // 7. Route guardok
    // ═══════════════════════════════════════════════════
    {
      title: '7. Route guardok – útvonalvédelem',
      side: 'client',
      sections: [
        {
          content: `Az Angular route guardok kliens oldali védelmet biztosítanak. A guard egy függvény, amelyet a Router navigáció előtt hív meg.

Fontos: a guard csak kliens oldali védelem! A szerveren is kell middleware.

4 GUARD A PROJEKTBEN:`
        },
        {
          content: `1. authGuard – Bejelentkezés szükséges
   → Ellenőrzi az AuthService.isAuthenticated() signal értékét
   → Ha true → return true → engedélyezi a navigációt
   → Ha false → returnUrl-ben elmenti az aktuális URL-t és /login-ra irányít
   → A returnUrl-nek köszönhetően bejelentkezés után visszakerül az eredeti oldalra
   → Védett útvonalak: /home, /products, /users, /tutorial`,
          codeBlocks: [
            {
              label: 'Angular – auth.guard.ts + guest.guard.ts',
              language: 'typescript',
              code: `// CanActivateFn: funkcionális guard (Angular 21)

// === authGuard: bejelentkezés szükséges ===
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // isAuthenticated() computed signal: true ha van user
  if (authService.isAuthenticated()) {
    return true;  // Bejelentkezett → engedélyezve
  }

  // Nem bejelentkezett → login + returnUrl mentése
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

// === guestGuard: csak vendégeknek ===
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;  // Nincs bejelentkezve → mehet
  }

  // Már bejelentkezett → főoldalra
  router.navigate(['/home']);
  return false;
};`
            }
          ]
        },
        {
          content: `2. guestGuard – Csak vendégeknek
   → Az authGuard ellentéte: csak NEM bejelentkezett felhasználókat enged
   → Ha be van jelentkezve → /home-ra irányít
   → Védett útvonalak: /login, /register`
        },
        {
          content: `3. editorGuard – EDITOR vagy ADMIN role szükséges
   → Lekéri a user objektumot az AuthService-ből
   → Ellenőrzi: user.role === 'EDITOR' || user.role === 'ADMIN'
   → Ha USER → átirányít (nincs jogosultság)
   → Védett útvonalak: /products, /products/new, /products/:id/edit

4. adminGuard – Kizárólag ADMIN
   → Csak 'ADMIN' role esetén engedélyez
   → Védett útvonalak: /users, /users/:id/edit`,
          codeBlocks: [
            {
              label: 'Angular – editor.guard.ts + admin.guard.ts',
              language: 'typescript',
              code: `// === editorGuard: EDITOR vagy ADMIN role ===
export const editorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.user();

  if (user && (user.role === 'EDITOR' || user.role === 'ADMIN')) {
    return true;
  }

  router.navigate(['/products']);
  return false;
};

// === adminGuard: kizárólag ADMIN ===
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.user();

  // ?. (optional chaining) véd a null ellen
  if (user?.role === 'ADMIN') {
    return true;
  }

  router.navigate(['/home']);
  return false;
};`
            }
          ]
        },
        {
          content: `GUARD LÁNCOLÁS:
  → Egy útvonalhoz több guard rendelhető: canActivate: [authGuard, editorGuard]
  → Az Angular sorban hívja meg – ha bármelyik false → navigáció blokkolt
  → A /products: először authGuard, majd editorGuard`,
          codeBlocks: [
            {
              label: 'Angular – app.routes.ts (Guard használat)',
              language: 'typescript',
              code: `export const routes: Routes = [
  // Csak vendégeknek (guestGuard)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login')
      .then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },

  // Bejelentkezés szükséges (authGuard)
  {
    path: 'home',
    loadComponent: () => import('./features/home/home')
      .then(m => m.HomeComponent),
    canActivate: [authGuard]
  },

  // ADMIN only (authGuard + adminGuard lánc)
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-list/user-list')
      .then(m => m.UserListComponent),
    canActivate: [authGuard, adminGuard]
  },

  // EDITOR/ADMIN (authGuard + editorGuard lánc)
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-list/product-list')
        .then(m => m.ProductListComponent),
    canActivate: [authGuard, editorGuard]
  },
];`
            }
          ]
        }
      ],
    },

    // ═══════════════════════════════════════════════════
    // 8. Szerepkör-alapú jogosultság
    // ═══════════════════════════════════════════════════
    {
      title: '8. Szerepkör-alapú jogosultság (kliens + szerver)',
      side: 'both',
      sections: [
        {
          content: `A szerepkör-alapú hozzáférés-vezérlés (RBAC) mind a kliens, mind a szerver oldalon meg van valósítva. A kettős védelem biztosítja, hogy API-szintű hozzáférés esetén se lehessen jogosulatlan műveletet végrehajtani.`
        },
        {
          content: `SZEREPKÖRÖK:

  • USER – Alap felhasználó
    → Csak a főoldalt és a tutorial oldalt látja
    → A navigációban: Kijelentkezés + Órai anyag

  • EDITOR – Szerkesztő
    → Termékeket kezelhet (listázás, létrehozás, szerkesztés, törlés)
    → A navigációban: Termékek gomb is megjelenik

  • ADMIN – Adminisztrátor
    → Mindent kezelhet: felhasználók + termékek
    → A Felhasználók és Termékek gombok is megjelennek
    → Felhasználók szerepkörét módosíthatja`
        },
        {
          content: `KLIENS OLDALI MEGOLDÁS (Angular):
  A HomeComponent-ben computed() signal-ekkel:
  → isAdmin = computed(() => user()?.role === 'ADMIN')
  → isEditorOrAdmin = computed(() => role === 'EDITOR' || role === 'ADMIN')

  A template-ben @if blokkokkal feltételesen:
  → @if (isAdmin()) { Felhasználók gomb }
  → @if (isEditorOrAdmin()) { Termékek gomb }
  → Ez csak UI korlátozás – URL-ből a guard blokkolja`,
          codeBlocks: [
            {
              label: 'Angular – home.ts (Computed signal-ek)',
              language: 'typescript',
              code: `export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // User signal az AuthService-ből (readonly)
  protected readonly user = this.authService.user;

  // computed(): automatikusan újraszámolódik
  // amikor a user() signal értéke változik
  protected readonly isAdmin = computed(
    () => this.user()?.role === 'ADMIN'
  );

  // EDITOR vagy ADMIN → termékek kezelése engedélyezett
  protected readonly isEditorOrAdmin = computed(() => {
    const role = this.user()?.role;
    return role === 'EDITOR' || role === 'ADMIN';
  });

  protected logout(): void {
    this.authService.logout().subscribe();
  }
}`
            },
            {
              label: 'Angular – home.html (Feltételes megjelenítés)',
              language: 'html',
              code: `<div class="home-card">
  <h1>Welcome!</h1>

  @if (user()) {
    <p class="user-info">
      Bejelentkezve: <strong>{{ user()?.name }}</strong>
      <span class="role-badge">{{ user()?.role }}</span>
    </p>
  }

  <nav class="nav-links">
    <!-- CSAK ADMIN-nak jelenik meg -->
    @if (isAdmin()) {
      <a routerLink="/users">Felhasználók</a>
    }

    <!-- EDITOR és ADMIN is látja -->
    @if (isEditorOrAdmin()) {
      <a routerLink="/products">Termékek</a>
    }

    <!-- Mindenki számára elérhető -->
    <a routerLink="/tutorial" class="btn-tutorial">
      JWT Órai anyag
    </a>
  </nav>

  <button class="logout-btn" (click)="logout()">
    Kijelentkezés
  </button>
</div>`
            }
          ]
        },
        {
          content: `SZERVER OLDALI MEGOLDÁS (Laravel):
  Route::middleware('role:EDITOR,ADMIN')
  → Az EnsureUserHasRole middleware ellenőrzi a user role mezőjét
  → Ha nincs jogosultság → 403 Forbidden
  → Ez a VALÓDI védelem`,
          codeBlocks: [
            {
              label: 'Laravel – EnsureUserHasRole middleware (Szerver)',
              language: 'php',
              code: `// Middleware: szerepkör alapú végpont-védelem
public function handle(
  Request $request, Closure $next,
  string ...$roles  // Variadic: tetszőleges számú role
): Response {
  $user = $request->user();

  if (!$user) {
    return response()->json(
      ['message' => 'Nincs bejelentkezve.'], 401
    );
  }

  foreach ($roles as $role) {
    if ($user->hasRole($role)) {
      return $next($request);  // Van jogosultsága
    }
  }

  return response()->json(
    ['message' => 'Nincs jogosultsága.'], 403
  );
}

// Route regisztráció (routes/api.php):
Route::middleware(['auth:sanctum', 'role:EDITOR,ADMIN'])
  ->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
  });

Route::middleware(['auth:sanctum', 'role:ADMIN'])
  ->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::patch('/users/{id}', [UserController::class, 'update']);
  });`
            }
          ]
        }
      ],
    },

    // ═══════════════════════════════════════════════════
    // 9. Token frissítés és hibakezelés
    // ═══════════════════════════════════════════════════
    {
      title: '9. Token frissítés (Refresh) és hibakezelés',
      side: 'both',
      sections: [
        {
          content: `Az access token rövid életű (60 perc). Lejáratkor a refresh tokennel kérünk újat – a felhasználónak nem kell újra bejelentkeznie.`
        },
        {
          content: `TOKEN FRISSÍTÉS FOLYAMATA:

1. [Kliens] API hívás → szerver 401 Unauthorized-dal válaszol (lejárt token)

2. [Kliens] Az auth.interceptor.ts catchError() észleli a 401-et
   → Ellenőrzi: nem /auth/refresh URL-en kaptuk-e (végtelen ciklus elkerülése!)
   → Meghívja AuthService.refreshToken()-t`
        },
        {
          content: `3. [Kliens] refreshToken() metódus:
   → Refresh token lekérése localStorage-ból
   → isRefreshing flag ellenőrzése (dupla frissítés megelőzése)
   → CSRF cookie + POST /api/auth/refresh kérés

4. [Szerver] Refresh végpont:
   → Hash-eli a kapott refresh tokent (SHA-256)
   → Megkeresi az adatbázisban
   → Ellenőrzi: nem revoked-e? Nem járt-e le?
   → Régi token visszavonása (revoked = true)
   → Új access + refresh token generálása

5. [Kliens] Az interceptor switchMap()-jában:
   → Új tokennel klónozza az eredeti kérést
   → Újraküldi → most 200 OK válasz jön`,
          codeBlocks: [
            {
              label: 'Angular – auth.service.ts (Token frissítés)',
              language: 'typescript',
              code: `// isRefreshing flag: dupla refresh megelőzése
private isRefreshing = false;

refreshToken(): Observable<AuthResponse> {
  const refreshToken = this.tokenStorage.getRefreshToken();

  if (!refreshToken || this.isRefreshing) {
    return throwError(
      () => new Error('No refresh token or already refreshing')
    );
  }

  this.isRefreshing = true;

  return this.getCsrfCookie().pipe(
    switchMap(() =>
      this.http.post<AuthResponse>(
        \`\${this.apiUrl}/refresh\`,
        { refresh_token: refreshToken },
        { withCredentials: true }
      )
    ),
    tap(response => {
      this.isRefreshing = false;
      this.handleAuthSuccess(response);  // Új tokenek mentése
    }),
    catchError(error => {
      this.isRefreshing = false;
      this.tokenStorage.clearTokens();   // Tokenek törlése
      return throwError(() => error);    // Újra be kell jelentkezni
    })
  );
}

// Kijelentkezés
logout(): Observable<void> {
  const accessToken = this.tokenStorage.getAccessToken();
  if (!accessToken) {
    this.clearAuthState();
    return of(undefined);
  }
  return this.http.post<void>(\`\${this.apiUrl}/logout\`, {}).pipe(
    tap(() => this.clearAuthState()),
    catchError(() => {
      this.clearAuthState();  // Hiba esetén is töröljük
      return of(undefined);
    })
  );
}

private clearAuthState(): void {
  this.tokenStorage.clearTokens();     // Memória + localStorage
  this.currentUser.set(null);          // User signal nullázás
  this.router.navigate(['/login']);     // Átirányítás
}`
            }
          ]
        },
        {
          content: `TOKEN ROTATION:
  → Minden refresh token EGYSZER használható
  → Használat után revoked = true
  → Ha valaki ellopja és a jogos user már használta → revoked → 401`
        },
        {
          content: `ERROR INTERCEPTOR:
  → Globális hibakezelő: HTTP státusz kód alapján reagál
  → 403: Nincs jogosultság (role probléma)
  → 404: Erőforrás nem található
  → 500: Szerver hiba
  → 0: Hálózati hiba (backend szerver nem fut)`,
          codeBlocks: [
            {
              label: 'Angular – error.interceptor.ts (Globális hibakezelés)',
              language: 'typescript',
              code: `// Globális HTTP hibakezelő interceptor
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 403:
          // Forbidden – nincs jogosultság
          console.error('Hozzáférés megtagadva:', error.message);
          break;

        case 404:
          // Not Found – erőforrás nem létezik
          console.error('Erőforrás nem található:', error.message);
          break;

        case 500:
          // Internal Server Error
          console.error('Szerver hiba:', error.message);
          break;

        case 0:
          // Network Error – nincs kapcsolat a szerverrel
          console.error(
            'Hálózati hiba – fut-e a backend szerver?'
          );
          break;
      }

      return throwError(() => error);  // Továbbdobás
    })
  );
};`
            }
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // 10. Összefoglalás
    // ═══════════════════════════════════════════════════
    {
      title: '10. Teljes rendszer áttekintés',
      side: 'both',
      sections: [
        {
          content: `A teljes JWT alapú hitelesítési rendszer működése:

┌────────────────────────────────────────────────────────┐
│  ANGULAR KLIENS             LARAVEL SZERVER            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. Regisztráció/Bejelentkezés                         │
│     ── GET /sanctum/csrf-cookie ──────►                │
│     ◄── Set-Cookie: XSRF-TOKEN ────────               │
│     ── POST /api/auth/login ──────────►                │
│     Header: X-XSRF-TOKEN: <csrf_token>                │
│     ◄── { user, access_token, refresh_token } ──      │
│                                                        │
│  2. Védett API hívás                                   │
│     ── GET /api/products ─────────────►                │
│     Header: Authorization: Bearer <token>              │
│     ◄── [ { id: 1, name: "..." }, ... ] ─────────     │
│                                                        │
│  3. Token lejárt (60 perc után)                        │
│     ── GET /api/products ─────────────►                │
│     ◄── 401 Unauthorized ────────────────────────     │
│                                                        │
│  4. Automatikus token frissítés (interceptor)          │
│     ── POST /api/auth/refresh ────────►                │
│     Body: { refresh_token: "<token>" }                 │
│     ◄── { új access_token, új refresh_token } ──      │
│                                                        │
│  5. Eredeti kérés újrapróbálása                        │
│     ── GET /api/products ─────────────►                │
│     Header: Authorization: Bearer <ÚJ_token>          │
│     ◄── [ { id: 1, name: "..." }, ... ] ─────────     │
│                                                        │
│  6. Kijelentkezés                                      │
│     ── POST /api/auth/logout ─────────►                │
│     Szerver: token visszavonás (revoked)               │
│     Kliens: memória + localStorage törlés              │
│     Átirányítás → /login                               │
│                                                        │
└────────────────────────────────────────────────────────┘`
        },
        {
          content: `BIZTONSÁGI RÉTEGEK:

• CSRF védelem – cookie + X-XSRF-TOKEN header minden módosító kéréshez
  → Megakadályozza, hogy más weboldal kéréseket küldjön a nevünkben

• Bearer token – Authorization header minden API híváshoz
  → A szerver azonosítja a felhasználót és ellenőrzi a token érvényességét

• Role middleware – szerver oldali végpont védelem
  → Ha valaki megkerülné a klienst, a szerver elutasítja`
        },
        {
          content: `• Route guardok – kliens oldali útvonalvédelem
  → authGuard, guestGuard, editorGuard, adminGuard

• Token rotation – refresh token egyszeri használat
  → Lopott token nem használható újra

• Jelszó hash – bcrypt az adatbázisban
  → Jelszavak soha nem tárolódnak olvasható formában`
        },
        {
          content: `INTERCEPTOR SORREND (app.config.ts):
  1. xsrfInterceptor – CSRF token csatolása (első!)
  2. authInterceptor – Bearer token + 401 kezelés
  3. errorInterceptor – Globális hibakezelés`,
          codeBlocks: [
            {
              label: 'Angular – app.config.ts (Teljes provider konfiguráció)',
              language: 'typescript',
              code: `export const appConfig: ApplicationConfig = {
  providers: [
    // Globális hibakezelő (Angular 21 beépített)
    provideBrowserGlobalErrorListeners(),

    // Router – az app.routes.ts útvonalaival
    provideRouter(routes),

    // HTTP kliens az interceptor lánccal
    provideHttpClient(
      // FONTOS: a sorrend számít!
      // 1. xsrfInterceptor: CSRF token csatolása
      // 2. authInterceptor: Bearer token + 401 kezelés
      // 3. errorInterceptor: Globális hibakezelés
      withInterceptors([
        xsrfInterceptor,
        authInterceptor,
        errorInterceptor
      ])
    ),

    // Transloco – többnyelvűség (demo-autopilot igényli)
    provideTransloco({
      config: {
        availableLangs: ['hu'],
        defaultLang: 'hu',
        prodMode: !isDevMode(),
        missingHandler: { logMissingKey: false }
      },
      loader: NoopTranslocoLoader
    }),

    // Demo Autopilot – interaktív bemutató rendszer
    provideDemoAutopilot({
      config: {
        debug: true,
        controlsPosition: 'bottom-right',
        defaultStepDelay: 1500,
        defaultCharDelay: 60
      },
      scripts: [jwtAuthDemoScript]
    })
  ]
};`
            }
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // 11. Kiegészítő fogalmak
    // ═══════════════════════════════════════════════════
    {
      title: '11. Kiegészítő fogalmak',
      side: 'both',
      tabs: [
        { label: 'Jelszóvédelem' },
        { label: 'Bejelentkezés-védelem' },
        { label: 'Webes támadások' },
      ],
      sections: [
        {
          content: `Ez az oldal a korábbi fejezetekben említett biztonsági fogalmakat fejti ki részletesen. A jelszóvédelemhez kapcsolódó technikák (Salting, Rainbow Table, Brute Force, Credential Stuffing, Timing Attack), a bejelentkezés-védelem eszközei (Rate Limiting, CAPTCHA, 2FA), valamint a webes támadások és védekezések (XSS, CSRF, Token Rotation) mind megtalálhatók itt.

Színjelölések:
  🔴 Piros kártya = Támadási módszer (amit a támadó csinál)
  🔵 Kék kártya = Védelmi technika (amivel védekezünk)
  🟢 Zöld kártya = Alapfogalom (hogyan működik)`
        },
        {
          tab: 0,
          label: 'Salting (Sózás)',
          labelType: 'defense',
          content: `Egy védelmi technika, amelynek lényege, hogy a jelszó hash-elésekor egy véletlenszerű, egyedi karaktersorozatot (salt) fűznek a jelszóhoz. Ezt a salt-ot nyíltan tárolják a hash mellett az adatbázisban. Célja, hogy még az azonos jelszavak is különböző hash-t kapjanak, így az előre kiszámított táblázatok (rainbow table) használhatatlanná válnak. Bejelentkezéskor a rendszer a tárolt salt-ot újra hozzáfűzi a beírt jelszóhoz, és az így kapott hash-t hasonlítja össze a tárolttal.`
        },
        {
          tab: 0,
          label: 'Rainbow Table (Szivárványtábla)',
          labelType: 'attack',
          content: `Egy előre kiszámított adatbázis, amely jelszavak és a hozzájuk tartozó hash-ek párosítását tartalmazza. A támadó nem valós időben töri fel a jelszót, hanem egyszerűen kikeresi a hash-t a táblázatban — ha megtalálja, azonnal tudja az eredeti jelszót. Hatékony a gyakori jelszavak ellen (pl. „123456", „password"), de a salting teljesen hatástalanítja: mivel a salt minden felhasználónál egyedi, a támadónak minden egyes salt-hoz külön rainbow table-t kellene generálnia, ami gyakorlatilag lehetetlen.`
        },
        {
          tab: 0,
          label: 'Brute Force (Nyers erő)',
          labelType: 'attack',
          content: `Egy támadási módszer, amelynek lényege, hogy a támadó az összes lehetséges kombinációt szisztematikusan végigpróbálja, amíg megtalálja a helyes jelszót. Nem igényel semmilyen előzetes tudást — egyszerűen mindent kipróbál. Hatékonysága a jelszó hosszától és komplexitásától függ: rövid, egyszerű jelszavak gyorsan feltörhetők, míg hosszú, összetett jelszavak esetén a szükséges idő gyakorlatilag végtelenné válik. Ellene a bejelentkezési korlátozások, CAPTCHA és lassú hash algoritmusok nyújtanak védelmet.`
        },
        {
          tab: 0,
          label: 'Credential Stuffing (Hitelesítő adatok tömörítése)',
          labelType: 'attack',
          content: `A credential stuffing egy célzott támadási módszer, amelynek lényege, hogy a támadó korábban kiszivárgott felhasználónév–jelszó párokat próbál ki más weboldalakon. A támadás azon alapul, hogy az emberek többsége ugyanazt a jelszót használja több szolgáltatásnál is.

Működése:
  1. Egy adatszivárgásból (pl. feltört webshop adatbázisa) a támadó megszerez millió email–jelszó párost
  2. Automatizált eszközökkel (botokkal) végigpróbálja ezeket más szolgáltatásokon (bank, közösségi média, email)
  3. Ahol a felhasználó ugyanazt a jelszót használta, a támadó bejut

Különbség a brute force-tól:
  • Brute force: az összes lehetséges kombinációt próbálja (a, b, c, ... aa, ab, ac ...)
  • Credential stuffing: valós, kiszivárgott jelszavakat használ — sokkal hatékonyabb, mert nem kell kitalálnia a jelszót

Védekezés:
  • Egyedi jelszó minden szolgáltatásnál (jelszókezelő használata)
  • Kétfaktoros hitelesítés (2FA) — még ha a jelszó kiszivárog, a második faktor véd
  • CAPTCHA — megakadályozza az automatizált tömeges próbálkozást
  • Rate limiting — lassítja a támadó próbálkozásait
  • Breached password check — a regisztrációnál ellenőrzi, hogy a jelszó szerepel-e ismert szivárgásokban (pl. Have I Been Pwned API)`
        },
        {
          tab: 0,
          label: 'Timing Attack (Időzítési támadás)',
          labelType: 'attack',
          content: `A timing attack egy oldalsó csatornás (side-channel) támadás, amelyben a támadó a szerver válaszidejéből próbál információt kinyerni. A lényege, hogy a szerver különböző ideig dolgozza fel a helyes és helytelen adatokat.

Példa jelszó-ellenőrzésnél:
  • Naiv összehasonlítás (karakter-by-karakter): ha az első karakter hibás, a szerver azonnal visszatér → gyors válasz. Ha az első 5 karakter helyes és a 6. hibás → lassabb válasz. A támadó a válaszidőből kitalálhatja, hány karakter egyezik.
  • Konkrétan: „aaaaaa" → 1 ms, „paaaaa" → 1.5 ms, „paxxxx" → 2 ms → a támadó tudja, hogy „pa..." kezdődik a jelszó

Védekezés — constant-time comparison:
  • A hash_equals() (PHP) és a crypto.timingSafeEqual() (Node.js) MINDIG ugyanannyi ideig fut, függetlenül attól, hány karakter egyezik
  • A bcrypt természetéből adódóan véd: mivel a teljes hash-t hasonlítja, nem az eredeti jelszót, a timing információ nem árulja el a jelszó karaktereit
  • A mi projektünkben a Laravel Hash::check() belsőleg constant-time összehasonlítást használ`
        },
        {
          tab: 1,
          label: 'Rate Limiting (Kéréskorlátozás)',
          labelType: 'defense',
          content: `A rate limiting egy védelmi technika, amely korlátozza, hogy egy adott forrásból (IP-cím, felhasználói fiók) mennyi kérés érkezhet egy meghatározott időablakon belül. Célja a szerver erőforrásainak védelme és a brute force típusú támadások lassítása.

Tipikus szabályok:
  • Login endpoint: max 5 próbálkozás / perc / IP-cím
  • API végpontok: max 60 kérés / perc / felhasználó
  • Regisztráció: max 3 fiók / óra / IP-cím

Megvalósítás:
  • Szerver oldali middleware (Laravel: ThrottleRequests)
  • A szerver HTTP fejlécekben jelzi a limitet: X-RateLimit-Limit (max kérések), X-RateLimit-Remaining (hátralévő), Retry-After (mikor próbálkozhat újra)
  • Túllépéskor 429 Too Many Requests státuszkóddal válaszol

Korlátai:
  • IP-alapú korlátozás megkerülhető proxy/VPN használatával
  • Elosztott támadásnál (botnet) minden IP-ről kevés kérés jön → egyenként nem lépi túl a limitet
  • Ezért kell kiegészíteni CAPTCHA-val és account lockout-tal`
        },
        {
          tab: 1,
          label: 'CAPTCHA',
          labelType: 'defense',
          content: `A CAPTCHA (Completely Automated Public Turing test to tell Computers and Humans Apart) egy olyan teszt, amely megkülönbözteti az emberi felhasználókat az automatizált programoktól (botoktól). Célja, hogy megakadályozza a gépek által végrehajtott tömeges műveleteket, például brute force támadásokat, spam regisztrációkat vagy automatizált űrlapbeküldéseket.

Típusai:
  • Képalapú: torzított szöveg felismerése (klasszikus CAPTCHA)
  • reCAPTCHA v2: „Nem vagyok robot" jelölőnégyzet + képválasztó feladatok
  • reCAPTCHA v3: láthatatlan, háttérben futó kockázatelemzés (0.0–1.0 pontszám)
  • hCaptcha: adatvédelem-központú alternatíva

Bejelentkezésnél a CAPTCHA kiegészíti a rate limiting-et: míg a rate limiting IP-cím alapján korlátoz, a CAPTCHA biztosítja, hogy valódi ember próbálkozik. A kettő együtt hatékonyan véd a brute force és credential stuffing támadások ellen.`
        },
        {
          tab: 1,
          label: '2FA (Kétfaktoros hitelesítés)',
          labelType: 'defense',
          content: `A kétfaktoros hitelesítés (Two-Factor Authentication) egy biztonsági mechanizmus, amely két különböző típusú azonosítást követel meg a bejelentkezéshez. A lényege: még ha a jelszót ellopják, a második faktor nélkül nem lehet belépni.

A három faktor kategória:
  • Valami, amit TUDSZ: jelszó, PIN kód
  • Valami, ami NÁLAD VAN: telefon (SMS kód, authenticator app), hardver kulcs (YubiKey)
  • Valami, ami TE VAGY: ujjlenyomat, arcfelismerés, retina szken

Gyakori megvalósítások:
  • SMS kód: a szerver 6 jegyű kódot küld SMS-ben → a felhasználó beírja. Hátránya: SIM-swap támadás (a támadó átveszi a telefonszámot)
  • TOTP (Time-based One-Time Password): a Google Authenticator / Authy app 30 másodpercenként új 6 jegyű kódot generál egy megosztott titkos kulcs alapján. Biztonságosabb az SMS-nél
  • WebAuthn / Passkey: hardver kulcs (USB/NFC) vagy biometrikus azonosítás. A legbiztonságosabb, mert phishing-rezisztens — a böngésző ellenőrzi a domain-t

Miért fontos a credential stuffing ellen?
Ha egy adatszivárgásból kiszivárog a jelszavad, a 2FA a második védelmi vonal: a támadónak a jelszó mellett a telefonodhoz vagy a hardver kulcsodhoz is hozzá kellene férnie.`
        },
        {
          tab: 2,
          label: 'XSS (Cross-Site Scripting)',
          labelType: 'attack',
          content: `Az XSS egy webes támadás, amelyben a támadó rosszindulatú JavaScript kódot juttat be egy megbízható weboldalra, és az a felhasználó böngészőjében fut le. Mivel a kód a megbízható oldal kontextusában fut, hozzáfér annak cookie-jaihoz, localStorage-ához és DOM-jához.

Három fő típusa:
  • Stored XSS: a rosszindulatú kód az adatbázisban tárolódik (pl. fórum hozzászólás), és minden látogató böngészőjében lefut
  • Reflected XSS: a kód az URL-ben vagy query paraméterben utazik, és a szerver visszatükrözi a válaszban (pl. keresési eredmény oldal)
  • DOM-based XSS: a kód közvetlenül a kliens oldali JavaScript-ben kerül feldolgozásra, a szerver nem is látja

XSS és a JWT token tárolás kapcsolata:
  • Ha a token localStorage-ban van → XSS támadással egy sor kóddal kilopható: localStorage.getItem('token')
  • Ha a token memóriában van (signal) → nehezebb hozzáférni, de nem lehetetlen
  • Ezért tároljuk a projektünkben az access tokent memóriában, NEM localStorage-ban

Angular védelmi mechanizmusok:
  • Automatikus sanitizáció: az Angular a template-ekben automatikusan escape-eli a HTML-t, így a <script> tag szövegként jelenik meg, nem fut le
  • DomSanitizer: ha mégis nyers HTML kell, a bypassSecurityTrust*() metódusokkal kikapcsolható — de ezt SOHA ne tegyük felhasználói adatokkal
  • Content Security Policy (CSP): HTTP fejléc, amely korlátozza, milyen forrásból futhat JavaScript az oldalon`
        },
        {
          tab: 2,
          label: 'CSRF Cookie – Mi a CSRF támadás?',
          labelType: 'attack',
          content: `A CSRF (Cross-Site Request Forgery) lényege, hogy egy támadó a bejelentkezett felhasználó nevében hajt végre nem kívánt műveletet egy másik weboldalon. Ez azért lehetséges, mert a böngésző automatikusan elküldi a cookie-kat minden kéréshez az adott domain felé — tehát ha be vagy jelentkezve a bankodon, és közben egy rosszindulatú oldalt nyitsz meg, az oldal a háttérben küldhet kérést a bankodnak a te session cookie-ddal.

Hogyan véd a CSRF cookie?
A szerver generál egy egyedi, véletlenszerű tokent, amelyet két helyen tárol:
  • Cookie-ban — a böngésző automatikusan kezeli
  • A HTML oldalon — rejtett form mezőben vagy HTTP fejlécben (pl. X-CSRF-Token)
Amikor a felhasználó küld egy kérést (pl. űrlapot küld be), a szerver összehasonlítja a két értéket: a cookie-ban lévő tokent és a kérésben (fejlécben/form mezőben) küldött tokent. Ha egyeznek, a kérés legitim.`
        },
        {
          tab: 2,
          label: 'CSRF Cookie – Miért működik?',
          labelType: 'defense',
          content: `A támadó oldala nem tudja kiolvasni a CSRF cookie értékét egy másik domain-ről (same-origin policy), így nem tudja azt a kérés fejlécébe vagy törzsébe beletenni. A böngésző ugyan automatikusan elküldi a cookie-t, de a támadó nem tudja a tokent a kérés másik részébe is beilleszteni — ezért a szerveren a két érték nem fog egyezni, és a kérés elutasításra kerül.

Login esetén a folyamat:
  1. A kliens kér egy CSRF tokent a szervertől (GET /sanctum/csrf-cookie)
  2. A szerver generálja a tokent, és cookie-ban visszaküldi a kliensnek
  3. A kliens kiolvassa a cookie-ból a token értékét (JavaScripttel, ezért nem lehet HttpOnly a cookie)
  4. Amikor a kliens elküldi a login POST kérést, két helyen is szerepel a token: a böngésző automatikusan csatolja a cookie-t, és a kliens kód is beleteszi egy HTTP fejlécbe (X-XSRF-TOKEN)
  5. A szerver összehasonlítja a kettőt — ha egyezik, a kérés legitim

Összefoglalva: a CSRF cookie egy kétfaktoros ellenőrzés — nem elég, hogy a böngésző elküldi a cookie-t, a kliens oldali kódnak is aktívan bizonyítania kell, hogy ismeri a token értékét. Ez biztosítja, hogy a kérés tényleg az adott weboldalról származik.`
        },
        {
          tab: 2,
          label: 'Token Rotation (Token forgatás)',
          labelType: 'defense',
          content: `A token rotation egy biztonsági mechanizmus, amelynek lényege, hogy a refresh token minden használatkor megújul: a szerver érvényteleníti a régit és újat ad ki. Így a refresh token egyszeri használatú lesz.

Miért fontos?
  • Refresh token nélkül: az access token lejárta után a felhasználónak újra be kellene jelentkeznie (rossz UX)
  • Rotation nélkül: ha a támadó megszerzi a refresh tokent, korlátlanul generálhat új access tokeneket
  • Rotation-nel: a lopott token egyszer használható — utána érvénytelen

A „poison pill" mechanizmus:
  1. A támadó ellopja a refresh tokent és használja → új access tokent kap, a régi refresh token érvénytelenné válik
  2. A jogos felhasználó is megpróbálja használni a (már érvénytelen) régi refresh tokent → 401 hiba
  3. A szerver észleli, hogy egy már felhasznált tokent próbáltak újra használni → gyanús! → az ÖSSZES tokent revokolja (token family invalidation)
  4. Mind a támadó, mind a felhasználó kijelentkeztetődik → a felhasználó új jelszóval lép be

A mi projektünkben:
  • A Laravel Sanctum a refresh endpoint-on új refresh tokent ad és a régit törli
  • A refresh tokent SHA-256 hash-elve tárolja az adatbázisban — ha az adatbázist ellopják, a token nem használható közvetlenül
  • Az isRefreshing flag megakadályozza, hogy több párhuzamos 401-es válasz egyszerre indítson refresh-t (race condition védelem)`
        },
        {
          tab: 2,
          label: 'SHA-256 (Secure Hash Algorithm)',
          labelType: 'info',
          content: `A SHA-256 egy kriptográfiai hash függvény, amely tetszőleges méretű adatból egy fix, 256 bites (64 hexadecimális karakteres) lenyomatot (hash-t) generál. A „hash" szó lényege: egyirányú — a hash-ből NEM lehet visszafejteni az eredeti adatot.

Tulajdonságai:
  • Determinisztikus: ugyanaz az input mindig ugyanazt a hash-t adja
  • Egyirányú: a hash-ből nem lehet visszafejteni az inputot
  • Lavinahatás: egyetlen karakter változása teljesen más hash-t eredményez
  • Ütközésálló: gyakorlatilag lehetetlen két különböző inputot találni, amelyek azonos hash-t adnak

Különbség a bcrypt és a SHA-256 között:
  • SHA-256: gyors, általános célú hash → fájlellenőrzés, digitális aláírás, token hash-elés
  • bcrypt: szándékosan LASSÚ, jelszó-specifikus hash → jelszó tárolás (brute force ellen)

A mi projektünkben:
  • A refresh tokent SHA-256-tal hash-elik az adatbázisban — ha az adatbázist ellopják, a hash-ből nem tudják visszafejteni a tokent
  • A JWT aláírás (Signature) HMAC-SHA256-ot használ: a payload + titkos kulcs kombinációját hash-eli
  • A bcrypt-et jelszavakhoz használjuk (lassú, salt-olt), a SHA-256-ot tokenekhez (gyors, de egyirányú)`
        },
        {
          tab: 2,
          label: 'HMAC (Hash-based Message Authentication Code)',
          labelType: 'info',
          content: `Az HMAC egy üzenet-hitelesítő kód, amely egy hash függvényt (pl. SHA-256) kombinál egy titkos kulccsal. Célja kettős: egyszerre biztosítja az adatok sértetlenségét (integrity) és hitelességét (authenticity).

Különbség a sima hash és a HMAC között:
  • SHA-256("hello") → bárki kiszámolhatja, nem bizonyít semmit
  • HMAC-SHA256("hello", titkos_kulcs) → csak az tudja kiszámolni, aki ismeri a kulcsot

Működése:
  1. A titkos kulcsot egy speciális padding-gel kombinálja (inner pad + outer pad)
  2. Az üzenetet a belső kulccsal hash-eli → köztes hash
  3. A köztes hash-t a külső kulccsal újra hash-eli → végső HMAC
  4. Ez a kettős hash-elés véd a „length extension attack" ellen, amely a sima hash-eknél lehetséges

A JWT-ben (HMAC-SHA256 / HS256):
  • Az input: Base64URL(header) + "." + Base64URL(payload)
  • A kulcs: a szerver titkos kulcsa (Laravel APP_KEY)
  • Az eredmény: a JWT harmadik része (Signature)
  • A szerver ellenőrzéskor újraszámolja a HMAC-ot és összehasonlítja → ha nem egyezik, a tokent elutasítja

Miért nem elég a sima SHA-256 az aláíráshoz?
Kulcs nélkül bárki kiszámolhatná a hash-t és készíthetne hamis tokent. A HMAC biztosítja, hogy CSAK a szerver (aki ismeri a kulcsot) tudjon érvényes aláírást készíteni.`
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe(params => {
      const stepParam = params.get('step');
      if (stepParam) {
        const stepIndex = parseInt(stepParam, 10) - 1;
        if (stepIndex >= 0 && stepIndex < this.steps.length) {
          this.activeStep.set(stepIndex);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  protected setActiveStep(index: number): void {
    this.activeStep.set(index);
    this.activeTab.set(0);
    this.router.navigate(['/tutorial', index + 1]);
    window.scrollTo({ top: 0 });
  }

  protected nextStep(): void {
    if (this.activeStep() < this.steps.length - 1) {
      const next = this.activeStep() + 1;
      this.activeStep.set(next);
      this.activeTab.set(0);
      this.router.navigate(['/tutorial', next + 1]);
      window.scrollTo({ top: 0 });
    }
  }

  protected prevStep(): void {
    if (this.activeStep() > 0) {
      const prev = this.activeStep() - 1;
      this.activeStep.set(prev);
      this.activeTab.set(0);
      this.router.navigate(['/tutorial', prev + 1]);
      window.scrollTo({ top: 0 });
    }
  }

  protected setTab(index: number): void {
    this.activeTab.set(index);
  }

  protected launchDemo(scriptId: string): void {
    this.autopilot.startDemo(scriptId).subscribe();
  }

  protected getSideBadge(side: string): string {
    switch (side) {
      case 'client': return 'Kliens';
      case 'server': return 'Szerver';
      default: return 'Kliens + Szerver';
    }
  }
}
