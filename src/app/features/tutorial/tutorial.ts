import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AutopilotService } from '@zssz-soft/demo-autopilot-core';
import { Subscription } from 'rxjs';

interface CodeBlock {
  label: string;
  language: 'typescript' | 'php' | 'html';
  code: string;
}

interface Step {
  title: string;
  side: 'client' | 'server' | 'both';
  contentItems: string[];
  codeBlocks: CodeBlock[];
}

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class TutorialComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly autopilot = inject(AutopilotService);
  private paramSub?: Subscription;

  protected readonly activeStep = signal(0);
  protected readonly tutorialScripts = this.autopilot.getScripts().filter(s => s.category === 'tutorial-step');
  protected readonly pageScripts = this.autopilot.getScripts().filter(s => s.category !== 'tutorial-step');

  protected readonly steps: Step[] = [
    // ═══════════════════════════════════════════════════
    // 1. Mi az a JWT?
    // ═══════════════════════════════════════════════════
    {
      title: '1. Mi az a JWT?',
      side: 'both',
      contentItems: [
        `A JSON Web Token (JWT) egy nyílt szabvány (RFC 7519), amely biztonságos módon továbbít információt két fél között JSON objektumként. A token digitálisan aláírt, ezért megbízható és ellenőrizhető.

Egy JWT három részből áll, ponttal (.) elválasztva:`,

        `HEADER (Fejléc):
Az algoritmus típusát és a token típusát tartalmazza. A mi projektünkben a Laravel Sanctum HS256 algoritmust használ, ami HMAC-SHA256 alapú szimmetrikus titkosítás. Ez azt jelenti, hogy ugyanaz a titkos kulcs (APP_KEY a .env fájlban) szolgál az aláíráshoz és az ellenőrzéshez is.`,

        `PAYLOAD (Hasznos teher):
A „claims" mezőket tartalmazza – ezek az adatok, amelyeket a token hordoz:
  • sub (subject) – a felhasználó egyedi azonosítója (user id)
  • iat (issued at) – a token kiállításának időpontja (Unix timestamp)
  • exp (expiration) – a token lejáratának időpontja
  • Egyedi mezők – a mi esetünkben: name, email, role`,

        `SIGNATURE (Aláírás):
A header és payload Base64URL kódolt összefűzéséből képzett HMAC-SHA256 hash, a szerver titkos kulcsával. Ha bárki módosítja a payload-ot (pl. átírja a role mezőt ADMIN-ra), az aláírás érvénytelen lesz és a szerver elutasítja.

Felépítés: eyJ<Header>.eyJ<Payload>.<Signature>`,

        `A projektünkben a szerver (Laravel Sanctum) generálja a JWT-t bejelentkezéskor, és a válaszban visszaküldi a kliensnek. Az Angular kliens eltárolja és minden API kéréshez automatikusan mellékeli az Authorization headerben.`
      ],
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
    },

    // ═══════════════════════════════════════════════════
    // 2. Regisztráció folyamata
    // ═══════════════════════════════════════════════════
    {
      title: '2. Regisztráció folyamata',
      side: 'both',
      contentItems: [
        `A regisztráció az a folyamat, amikor egy új felhasználó fiókot hoz létre. A teljes folyamat a kliens és szerver között zajlik.`,

        `KLIENS OLDAL (Angular):

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

        `3. A Submit gomb megnyomásakor az onSubmit() fut le
   → Ha invalid: az összes mezőt „touched" állapotra állítja → hibaüzenetek megjelennek
   → Ha valid: meghívja az AuthService.register() metódust

4. Az AuthService.register() két HTTP kérést küld (pipe + switchMap):
   → Először: GET /sanctum/csrf-cookie – CSRF token lekérése
   → Majd: POST /api/auth/register – a form adatok elküldése
   → withCredentials: true → a böngésző elküldi a cookie-kat cross-origin kérésnél`,

        `SZERVER OLDAL (Laravel):

5. A RegisterRequest validálja az adatokat
   → Ha sikertelen → 422 Unprocessable Entity válasz

6. Jelszó hash-elése bcrypt-tel
   → Egyirányú hash: a jelszó nem fejthető vissza
   → Minden hash-hez egyedi „salt" generálódik

7. Felhasználó létrehozása a users táblában (alapértelmezett role: USER)`,

        `8. Token pár generálása
   → Access token: Sanctum createToken() (60 perc lejárat)
   → Refresh token: 64 karakter string, SHA-256 hash-elve mentve (7 nap lejárat)

9. JSON válasz: { user, access_token, refresh_token, token_type, expires_in }`,

        `KLIENS OLDAL – válasz feldolgozása:

10. A handleAuthSuccess() metódus:
    → Access tokent memóriába menti (signal)
    → Refresh tokent localStorage-ba menti
    → A currentUser signal-t beállítja
    → Átirányít a /home oldalra`
      ],
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
        },
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

    // ═══════════════════════════════════════════════════
    // 3. Bejelentkezés folyamata
    // ═══════════════════════════════════════════════════
    {
      title: '3. Bejelentkezés folyamata',
      side: 'both',
      contentItems: [
        `A bejelentkezés a meglévő felhasználó hitelesítése email és jelszó alapján.`,

        `KLIENS OLDAL (Angular):

1. A felhasználó megnyitja a /login oldalt
   → A guestGuard ellenőrzi: ha be van jelentkezve → /home-ra irányít

2. A LoginComponent Reactive Form-ot használ két mezővel:
   → email: kötelező + érvényes email formátum
   → password: kötelező + minimum 8 karakter
   → Az isLoading és error signal-ek az AuthService-ből jönnek`,

        `3. Az onSubmit() metódus:
   → Ha invalid: markAsTouched() minden mezőre → hibaüzenetek megjelennek
   → Ha valid: AuthService.login() hívás a { email, password } objektummal
   → Siker esetén: a returnUrl query paraméterből olvassa ki a céloldalt
   → Ez azért fontos, mert ha az authGuard irányította ide a felhasználót,
     akkor bejelentkezés után visszanavigáljon az eredeti oldalra`,

        `4. Az AuthService.login() RxJS pipe-ban:
   → getCsrfCookie(): GET /sanctum/csrf-cookie
   → switchMap(): POST /api/auth/login (email + jelszó)
   → tap(): handleAuthSuccess() – tokenek mentése
   → catchError(): handleAuthError() – hibaüzenet beállítása`,

        `SZERVER OLDAL (Laravel):

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
      ],
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
        },
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
        },
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
      ],
    },

    // ═══════════════════════════════════════════════════
    // 4. Token tárolás stratégia
    // ═══════════════════════════════════════════════════
    {
      title: '4. Token tárolás stratégia',
      side: 'client',
      contentItems: [
        `A tokenek biztonságos tárolása az egyik legfontosabb döntés JWT rendszerben. Két különböző helyen tároljuk a két tokent:`,

        `ACCESS TOKEN (rövid életű, 60 perc):
  → Memóriában tároljuk Angular signal-ben (NEM localStorage-ban!)
  → Minden API kéréshez csatoljuk az Authorization headerben
  → Ha az oldal újratöltődik (F5), az access token elvész
  → Ezért kell a refresh token: újratöltéskor automatikusan újat kérünk
  → Signal-ben tároljuk: a TokenStorageService accessTokenInMemory signal-t használ
  → A signal() reaktív: a template és computed() azonnal látja a változást`,

        `REFRESH TOKEN (hosszú életű, 7 nap):
  → localStorage-ban tároljuk (túléli az oldal újratöltést)
  → Kizárólag token frissítéshez használjuk (POST /api/auth/refresh)
  → A szerveren SHA-256 hash-elve van tárolva
  → Egyszeri használatú: frissítéskor új refresh tokent is kapunk (token rotation)`,

        `LEJÁRAT KEZELÉSE:
  → Az expires_in értékből kiszámítjuk a lejárati időpontot (Date.now() + expires_in * 1000)
  → localStorage-ban tároljuk „expires_at" kulcs alatt
  → Az isTokenExpiringSoon() metódus 5 perces küszöbbel figyeli
  → A hasValidToken computed signal automatikusan false-ra vált ha lejárt`,

        `MIÉRT NEM LOCALSTORAGE AZ ACCESS TOKEN?
  → XSS (Cross-Site Scripting) támadás esetén a localStorage kiolvasható
  → A memóriában tárolt token XSS esetén nehezebben hozzáférhető
  → A refresh token localStorage-ban van, de az csak frissítésre használható`
      ],
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

    // ═══════════════════════════════════════════════════
    // 5. Auth Interceptor
    // ═══════════════════════════════════════════════════
    {
      title: '5. Auth Interceptor – automatikus token csatolás',
      side: 'client',
      contentItems: [
        `Az Angular HTTP interceptor egy köztes réteg, amely minden kimenő HTTP kérést elfog és módosíthat. A mi auth interceptorunk automatikusan hozzáadja a JWT tokent az API kérésekhez.

MIÉRT INTERCEPTOR?
  → Nem kell minden HTTP hívásban kézzel beállítani az Authorization headert
  → Egyetlen helyen, centralizáltan kezeljük a token csatolást
  → A szolgáltatásoknak (ProductService, UserService) nem kell tudniuk a tokenről`,

        `KIZÁRT URL-EK:
  → A login, register és refresh végpontokhoz NEM kell token
  → Az „excludedUrls" tömbben vannak felsorolva
  → Ha a kérés URL-je tartalmazza valamelyiket, továbbengedi módosítás nélkül`,

        `TOKEN CSATOLÁS:
  → TokenStorageService-ből lekéri az access tokent (memóriából)
  → Ha van token → klónozza a kérést és hozzáadja: Authorization: Bearer <token>
  → req.clone() szükséges, mert a HttpRequest immutable (nem módosítható)`,

        `401 UNAUTHORIZED KEZELÉS:
  → Ha a szerver 401-et küld (lejárt token), automatikusan megpróbálja frissíteni
  → Meghívja az AuthService.refreshToken() metódust
  → Ha sikeres → az eredeti kérést újraküldi az új tokennel
  → Ha a refresh is sikertelen → a hiba továbbdobódik
  → A /auth/refresh URL-re érkező 401-et NEM próbálja újra (végtelen ciklus elkerülése!)`
      ],
      codeBlocks: [
        {
          label: 'Angular – auth.interceptor.ts (Teljes kód)',
          language: 'typescript',
          code: `// HttpInterceptorFn: funkcionális interceptor (Angular 21 ajánlás)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  // Ezekhez NEM kell Bearer token
  const excludedUrls = [
    '/auth/login', '/auth/register', '/auth/refresh'
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

    // ═══════════════════════════════════════════════════
    // 6. CSRF védelem
    // ═══════════════════════════════════════════════════
    {
      title: '6. CSRF védelem',
      side: 'both',
      contentItems: [
        `A CSRF (Cross-Site Request Forgery) egy támadási forma, ahol egy rosszindulatú weboldal a felhasználó nevében küld kéréseket a szerverünknek.`,

        `PÉLDA TÁMADÁS:
  → A felhasználó bejelentkezik az alkalmazásunkba (cookie-k beállítódnak)
  → Egy másik tab-on megnyit egy rosszindulatú oldalt
  → Az oldal egy rejtett form-mal POST kérést küld a mi /api/products végpontunkra
  → A böngésző automatikusan mellékeli a cookie-kat → a szerver azt hiszi, jogos kérés`,

        `HOGYAN VÉDEKEZÜNK?
  → A Laravel Sanctum beállít egy XSRF-TOKEN cookie-t a /sanctum/csrf-cookie végponton
  → A kliens kiolvassa ezt a cookie-t és X-XSRF-TOKEN headerként visszaküldi
  → A szerver összehasonlítja a cookie és a header értékét
  → Ha nem egyeznek → 419 CSRF Token Mismatch hiba
  → A rosszindulatú oldal NEM tudja kiolvasni a mi domain cookie-jainkat (Same-Origin Policy)`,

        `MIÉRT KELL EGYEDI INTERCEPTOR?
  → Az Angular beépített HttpClientXsrfModule csak same-origin kéréseknél működik
  → Nálunk a frontend (localhost:4200) és backend (localhost:8000) különböző porton fut
  → Ez cross-origin kérés → az Angular beépített XSRF kezelése nem működik
  → Ezért írtunk custom xsrfInterceptor-t`,

        `INTERCEPTOR MŰKÖDÉSE:
  → Csak módosító kérésekhez fut (POST, PUT, PATCH, DELETE) – GET nem igényel CSRF védelmet
  → Kiolvassa az XSRF-TOKEN cookie-t a document.cookie-ból
  → URL-dekódolja (a Laravel URL-kódolva küldi)
  → Hozzáadja X-XSRF-TOKEN headerként a kéréshez`
      ],
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
        },
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

    // ═══════════════════════════════════════════════════
    // 7. Route guardok
    // ═══════════════════════════════════════════════════
    {
      title: '7. Route guardok – útvonalvédelem',
      side: 'client',
      contentItems: [
        `Az Angular route guardok kliens oldali védelmet biztosítanak. A guard egy függvény, amelyet a Router navigáció előtt hív meg.

Fontos: a guard csak kliens oldali védelem! A szerveren is kell middleware.

4 GUARD A PROJEKTBEN:`,

        `1. authGuard – Bejelentkezés szükséges
   → Ellenőrzi az AuthService.isAuthenticated() signal értékét
   → Ha true → return true → engedélyezi a navigációt
   → Ha false → returnUrl-ben elmenti az aktuális URL-t és /login-ra irányít
   → A returnUrl-nek köszönhetően bejelentkezés után visszakerül az eredeti oldalra
   → Védett útvonalak: /home, /products, /users, /tutorial`,

        `2. guestGuard – Csak vendégeknek
   → Az authGuard ellentéte: csak NEM bejelentkezett felhasználókat enged
   → Ha be van jelentkezve → /home-ra irányít
   → Védett útvonalak: /login, /register`,

        `3. editorGuard – EDITOR vagy ADMIN role szükséges
   → Lekéri a user objektumot az AuthService-ből
   → Ellenőrzi: user.role === 'EDITOR' || user.role === 'ADMIN'
   → Ha USER → átirányít (nincs jogosultság)
   → Védett útvonalak: /products, /products/new, /products/:id/edit

4. adminGuard – Kizárólag ADMIN
   → Csak 'ADMIN' role esetén engedélyez
   → Védett útvonalak: /users, /users/:id/edit`,

        `GUARD LÁNCOLÁS:
  → Egy útvonalhoz több guard rendelhető: canActivate: [authGuard, editorGuard]
  → Az Angular sorban hívja meg – ha bármelyik false → navigáció blokkolt
  → A /products: először authGuard, majd editorGuard`
      ],
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
        },
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
        },
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
      ],
    },

    // ═══════════════════════════════════════════════════
    // 8. Szerepkör-alapú jogosultság
    // ═══════════════════════════════════════════════════
    {
      title: '8. Szerepkör-alapú jogosultság (kliens + szerver)',
      side: 'both',
      contentItems: [
        `A szerepkör-alapú hozzáférés-vezérlés (RBAC) mind a kliens, mind a szerver oldalon meg van valósítva. A kettős védelem biztosítja, hogy API-szintű hozzáférés esetén se lehessen jogosulatlan műveletet végrehajtani.`,

        `SZEREPKÖRÖK:

  • USER – Alap felhasználó
    → Csak a főoldalt és a tutorial oldalt látja
    → A navigációban: Kijelentkezés + Órai anyag

  • EDITOR – Szerkesztő
    → Termékeket kezelhet (listázás, létrehozás, szerkesztés, törlés)
    → A navigációban: Termékek gomb is megjelenik

  • ADMIN – Adminisztrátor
    → Mindent kezelhet: felhasználók + termékek
    → A Felhasználók és Termékek gombok is megjelennek
    → Felhasználók szerepkörét módosíthatja`,

        `KLIENS OLDALI MEGOLDÁS (Angular):
  A HomeComponent-ben computed() signal-ekkel:
  → isAdmin = computed(() => user()?.role === 'ADMIN')
  → isEditorOrAdmin = computed(() => role === 'EDITOR' || role === 'ADMIN')

  A template-ben @if blokkokkal feltételesen:
  → @if (isAdmin()) { Felhasználók gomb }
  → @if (isEditorOrAdmin()) { Termékek gomb }
  → Ez csak UI korlátozás – URL-ből a guard blokkolja`,

        `SZERVER OLDALI MEGOLDÁS (Laravel):
  Route::middleware('role:EDITOR,ADMIN')
  → Az EnsureUserHasRole middleware ellenőrzi a user role mezőjét
  → Ha nincs jogosultság → 403 Forbidden
  → Ez a VALÓDI védelem`
      ],
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
        },
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
      ],
    },

    // ═══════════════════════════════════════════════════
    // 9. Token frissítés és hibakezelés
    // ═══════════════════════════════════════════════════
    {
      title: '9. Token frissítés (Refresh) és hibakezelés',
      side: 'both',
      contentItems: [
        `Az access token rövid életű (60 perc). Lejáratkor a refresh tokennel kérünk újat – a felhasználónak nem kell újra bejelentkeznie.`,

        `TOKEN FRISSÍTÉS FOLYAMATA:

1. [Kliens] API hívás → szerver 401 Unauthorized-dal válaszol (lejárt token)

2. [Kliens] Az auth.interceptor.ts catchError() észleli a 401-et
   → Ellenőrzi: nem /auth/refresh URL-en kaptuk-e (végtelen ciklus elkerülése!)
   → Meghívja AuthService.refreshToken()-t`,

        `3. [Kliens] refreshToken() metódus:
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

        `TOKEN ROTATION:
  → Minden refresh token EGYSZER használható
  → Használat után revoked = true
  → Ha valaki ellopja és a jogos user már használta → revoked → 401`,

        `ERROR INTERCEPTOR:
  → Globális hibakezelő: HTTP státusz kód alapján reagál
  → 403: Nincs jogosultság (role probléma)
  → 404: Erőforrás nem található
  → 500: Szerver hiba
  → 0: Hálózati hiba (backend szerver nem fut)`
      ],
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
        },
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
    },

    // ═══════════════════════════════════════════════════
    // 10. Összefoglalás
    // ═══════════════════════════════════════════════════
    {
      title: '10. Teljes rendszer áttekintés',
      side: 'both',
      contentItems: [
        `A teljes JWT alapú hitelesítési rendszer működése:

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
└────────────────────────────────────────────────────────┘`,

        `BIZTONSÁGI RÉTEGEK:

• CSRF védelem – cookie + X-XSRF-TOKEN header minden módosító kéréshez
  → Megakadályozza, hogy más weboldal kéréseket küldjön a nevünkben

• Bearer token – Authorization header minden API híváshoz
  → A szerver azonosítja a felhasználót és ellenőrzi a token érvényességét

• Role middleware – szerver oldali végpont védelem
  → Ha valaki megkerülné a klienst, a szerver elutasítja`,

        `• Route guardok – kliens oldali útvonalvédelem
  → authGuard, guestGuard, editorGuard, adminGuard

• Token rotation – refresh token egyszeri használat
  → Lopott token nem használható újra

• Jelszó hash – bcrypt az adatbázisban
  → Jelszavak soha nem tárolódnak olvasható formában`,

        `INTERCEPTOR SORREND (app.config.ts):
  1. xsrfInterceptor – CSRF token csatolása (első!)
  2. authInterceptor – Bearer token + 401 kezelés
  3. errorInterceptor – Globális hibakezelés`
      ],
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
    this.router.navigate(['/tutorial', index + 1]);
  }

  protected nextStep(): void {
    if (this.activeStep() < this.steps.length - 1) {
      const next = this.activeStep() + 1;
      this.activeStep.set(next);
      this.router.navigate(['/tutorial', next + 1]);
    }
  }

  protected prevStep(): void {
    if (this.activeStep() > 0) {
      const prev = this.activeStep() - 1;
      this.activeStep.set(prev);
      this.router.navigate(['/tutorial', prev + 1]);
    }
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
