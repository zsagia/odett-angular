import { DemoScript } from '@zssz-soft/demo-autopilot-core';

// ═══════════════════════════════════════════════════
// 1. Mi az a JWT?
// ═══════════════════════════════════════════════════
const step1Script: DemoScript = {
  id: 'tutorial-step-1',
  name: '1. Mi az a JWT?',
  description: 'JWT felépítése, Header/Payload/Signature, és a TypeScript interfészek.',
  category: 'tutorial-step',
  tags: ['jwt', 'token', 'basics'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's1-nav',
      label: 'Mi az a JWT?',
      action: { type: 'click', selector: '.step-nav button:nth-child(1)' },
      delayAfter: 600,
      tooltip: {
        title: 'Mi az a JWT?',
        content: 'A hagyományos session-alapú rendszerek állapotot tárolnak a szerveren (memória/adatbázis). A JWT stateless megoldás: a szerver NEM tárolja a session-t, minden szükséges adat a tokenben van. Így a szerver skálázható – bármelyik szerver ellenőrizheti a tokent a titkos kulccsal, nem kell közös session store.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's1-intro',
      label: 'JWT bevezető',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Mi az a JWT?',
        content: 'A JWT lényege a „bizalom meghosszabbítása": egyszer hitelesítjük a felhasználót (jelszóval), utána a token bizonyítja a személyazonosságát minden kérésben. Fontos: a JWT NEM titkosított, csak aláírt – bárki olvashatja a tartalmát (Base64URL dekódolással), de nem módosíthatja érvényesen.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's1-header',
      label: 'Header',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'HEADER (Fejléc)',
        content: 'A HS256 szimmetrikus algoritmus: egyetlen titkos kulcs (APP_KEY) aláír ÉS ellenőriz. Előnye az egyszerűség, hátránya: minden ellenőrző félnek ismernie kell a kulcsot. Nagyobb rendszereknél RS256-ot (aszimmetrikus) használnak: privát kulcs aláír, publikus kulcs ellenőriz – így a microservice-ek nem ismerik a titkos kulcsot.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's1-payload',
      label: 'Payload',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'PAYLOAD (Hasznos teher)',
        content: 'A „claims" szó jogi fogalom: állítás/igény. A token „állítja", hogy sub=5 user ADMIN role-lal rendelkezik. A szerver az aláírás ellenőrzésével bizonyosodik meg, hogy ezek az állítások tőle származnak és nem hamisítottak. SOHA ne tegyünk érzékeny adatot (jelszó, bankszámla) a payload-ba, mert Base64URL dekódolással bárki olvashatja!',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's1-signature',
      label: 'Signature',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'SIGNATURE (Aláírás)',
        content: 'Gondolj rá úgy, mint egy viaszpecsét: ha valaki feltöri a borítékot és módosítja a levelet, a pecsét sérül. Ha egy támadó elfogja a tokent és átírja role=ADMIN-ra, a Signature nem fog egyezni, mert nem ismeri a titkos kulcsot (APP_KEY). A szerver ezért 401-gyel elutasítja.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's1-usage',
      label: 'Használat a projektben',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'JWT a projektünkben',
        content: 'A JWT-s rendszer előnye az SPA-knak (Single Page Application): a kliens önállóan hitelesíti magát minden kérésnél, nincs szükség session cookie-ra. Ez lehetővé teszi, hogy a frontend és backend különböző domainen fusson (cross-origin), és a szerver horizontálisan skálázható legyen (több szerver, nincs közös session).',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's1-code',
      label: 'TypeScript interfészek',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .code-block' },
      tooltip: {
        title: 'TypeScript interfészek',
        content: 'A TypeScript interfészek compile-time típusbiztonságot adnak: ha a szerver válasza nem egyezik az AuthResponse struktúrával, a fejlesztő azonnal hibát lát. A role union type (\'USER\' | \'EDITOR\' | \'ADMIN\') nem engedi elírni a role nevet, és az IDE autocomplete-et is ad.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .code-block', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 2. Regisztráció folyamata
// ═══════════════════════════════════════════════════
const step2Script: DemoScript = {
  id: 'tutorial-step-2',
  name: '2. Regisztráció',
  description: 'Reactive Form, CSRF cookie, szerver validáció, token generálás.',
  category: 'tutorial-step',
  tags: ['register', 'form', 'csrf'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's2-nav',
      label: 'Regisztráció',
      action: { type: 'click', selector: '.step-nav button:nth-child(2)' },
      delayAfter: 600,
      tooltip: {
        title: 'Regisztráció – áttekintés',
        content: 'A regisztráció a legösszetettebb auth flow: validáció 3 szinten történik (HTML5 attribútumok → Angular Validators → Laravel FormRequest). Ez a „defense in depth" elv: ha egy réteget megkerülnek (pl. DevTools-szal), a következő még véd.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's2-intro',
      label: 'Bevezető',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Regisztráció',
        content: 'Fontos különbség a regisztráció és bejelentkezés között: regisztrációnál LÉTREHOZUNK egy új erőforrást (user), bejelentkezésnél csak ELLENŐRIZZÜK a meglévőt. Ezért van a regisztrációnál több validáció (password_confirmation, email egyediség) és bcrypt hash-elés.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's2-client-1-2',
      label: 'Kliens: navigáció + form',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'Kliens: navigáció és form',
        content: 'A Reactive Form a „single source of truth" elv: a form állapota (értékek, validitás, touched) a TypeScript-ben van, nem a DOM-ban. A passwordMatchValidator cross-field validator: a FORM szintjén fut (nem a mezők szintjén), mert két mező értékét kell összehasonlítania.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's2-component',
      label: 'RegisterComponent kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .code-block' },
      tooltip: {
        title: 'RegisterComponent',
        content: 'Az inject() az Angular Dependency Injection rendszere: nem mi hozzuk létre a szolgáltatásokat (new AuthService()), hanem az Angular DI container adja. Ez tesztelhetővé teszi a kódot: tesztekben mock service-t injektálhatunk. A FormBuilder is injektált – így konzisztens az egész appban.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's2-client-3-4',
      label: 'Kliens: submit + HTTP',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Submit és HTTP kérések',
        content: 'A markAsTouched() UX szempontból fontos: az Angular alapból nem mutat validációs hibát amíg a user nem „érintette" a mezőt. Submit-kor kézzel kiváltjuk, hogy az összes hiba megjelenjen. A switchMap() „megszakító" operátor: ha a CSRF közben újabb subscribe jönne, az előzőt leállítja.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's2-service',
      label: 'AuthService register() kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .code-block' },
      tooltip: {
        title: 'AuthService register()',
        content: 'Az RxJS pipe funkcionális programozási minta: az adatok „csövön" folynak végig. A switchMap szekvenciálisan láncolja a kéréseket, a tap „mellékhatást" hajt végre (token mentés) az adatfolyam megváltoztatása nélkül. A catchError elkap minden hibát. Ez olvashatóbb, mint a callback hell vagy try-catch láncolás.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's2-server-5-7',
      label: 'Szerver: validáció + hash',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'Szerver oldali feldolgozás',
        content: 'A bcrypt szándékosan LASSÚ algoritmus (~200 ms): brute-force támadásnál max 5 próba/mp, szemben az MD5 millióival. A salt egyedi minden jelszóhoz, így két azonos jelszó különböző hash-t kap – ez véd a rainbow table támadás ellen.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's2-server-8-9',
      label: 'Szerver: token generálás',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'Token generálás és válasz',
        content: 'A 60 perces access token és 7 napos refresh token tudatos kompromisszum: az access token rövid, így lopás esetén gyorsan lejár. A refresh token hosszú, hogy ne kelljen naponta többször bejelentkezni. A refresh tokent SHA-256-tal hash-elik a DB-ben – adatbázis-szivárgás esetén sem használható.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's2-success',
      label: 'handleAuthSuccess',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(6) > .content-item' },
      tooltip: {
        title: 'Válasz feldolgozása',
        content: 'A signal-alapú állapotkezelés reaktív: amikor a currentUser signal értéke változik, minden computed() és template automatikusan frissül (pl. isAuthenticated, isAdmin). Ez deklaratív megközelítés – nem kell kézzel frissíteni az UI-t, a signal rendszer gondoskodik róla.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(6) > .content-item', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 3. Bejelentkezés folyamata
// ═══════════════════════════════════════════════════
const step3Script: DemoScript = {
  id: 'tutorial-step-3',
  name: '3. Bejelentkezés',
  description: 'Login flow, Reactive Form, returnUrl kezelés, szerver autentikáció.',
  category: 'tutorial-step',
  tags: ['login', 'auth', 'form'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's3-nav',
      label: 'Bejelentkezés',
      action: { type: 'click', selector: '.step-nav button:nth-child(3)' },
      delayAfter: 600,
      tooltip: {
        title: 'Bejelentkezés',
        content: 'A bejelentkezés a leggyakrabban támadott végpont: brute-force, credential stuffing, timing attack. A generikus hibaüzenet („Hibás email vagy jelszó") biztonsági oka: ha külön mondanánk „email nem létezik" vs „rossz jelszó", a támadó megtudná, mely email címek regisztráltak.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's3-intro',
      label: 'Bevezető',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Bejelentkezés',
        content: 'A hitelesítés (authentication) és az engedélyezés (authorization) két különböző fogalom: a login a hitelesítés – „ki vagy te?". Az authorization később történik (guardok, middleware) – „mit szabad csinálnod?". A JWT mindkettőt támogatja: a token bizonyítja ki vagy (sub), és mit szabad (role).',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's3-client-1-2',
      label: 'Kliens: guard + form',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'Guard és form',
        content: 'Az isLoading és error signal-ek az AuthService-ből jönnek – ez a „signal lifting" minta: az állapot a service-ben él (singleton), a komponens csak olvassa. Ha több komponens is mutatná a loading állapotot, mindenhol szinkronban lenne. A .asReadonly() nézet megakadályozza a komponensek általi módosítást.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's3-component-code',
      label: 'LoginComponent kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .code-block' },
      tooltip: {
        title: 'LoginComponent kód',
        content: 'Az ActivatedRoute az Angular Router által injektált service, ami az aktuális útvonal adatait tartalmazza. A snapshot egyszeri pillanatnyi értéket ad (nem reaktív), míg a paramMap observable folyamatosan figyeli a változásokat. Login-nál a snapshot elég, mert az URL nem változik a form kitöltése közben.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's3-submit',
      label: 'Submit + returnUrl',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Submit és returnUrl',
        content: 'A returnUrl pattern UX szempontból fontos: ha a user a /products-ot böngészte és lejárt a token → authGuard /login-ra irányít returnUrl=/products-szal → login után visszanavigál. A route.snapshot-ot használjuk (nem observable-t), mert a login oldalon a query param nem változik.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's3-template-code',
      label: 'Login template kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .code-block' },
      tooltip: {
        title: 'Login template',
        content: 'A role="alert" ARIA attribútum: a képernyőolvasó (screen reader) azonnal felolvassa a megjelenő hibaüzenetet – akadálymentességi (a11y) követelmény. A formControlName köti össze a HTML input-ot a TypeScript FormControl-lal – ez a Reactive Forms kétirányú kötése, de a Model (TS) az elsődleges.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's3-service',
      label: 'AuthService.login() pipe',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'AuthService.login() RxJS pipe',
        content: 'Figyeld meg a DRY (Don\'t Repeat Yourself) elvet: a getCsrfCookie(), handleAuthSuccess() és handleAuthError() közös metódusok – a login() és register() is használja. Ha változik a token kezelés logikája, egyetlen helyen kell módosítani. Ez a service pattern legnagyobb előnye.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's3-login-code',
      label: 'AuthService login() kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .code-block' },
      tooltip: {
        title: 'AuthService login() kód',
        content: 'A signal.set() szinkron állapotváltozás: loading.set(true) azonnal frissíti a gombot (disabled). Az authError.set(null) törli az előző hibát – fontos, hogy ne maradjon régi hibaüzenet. Ha a getCsrfCookie() hálózati hibával elszáll, a switchMap NEM fut le, a catchError kapja el – ez az RxJS hiba-propagáció.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's3-server',
      label: 'Szerver oldal',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'Szerver oldali hitelesítés',
        content: 'A Hash::check() a bcrypt hash-t hasonlítja: a tárolt hash tartalmazza a salt-ot is ($2y$10$salt...). A „constant-time comparison" megelőzi a timing attack-et: a válaszidőből nem lehet kitalálni, hány karakter egyezik. Produkciós rendszereknél rate limiting is kell (pl. max 5 próba/perc).',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 4. Token tárolás stratégia
// ═══════════════════════════════════════════════════
const step4Script: DemoScript = {
  id: 'tutorial-step-4',
  name: '4. Token tárolás',
  description: 'Access token memóriában, refresh token localStorage-ban, lejárat kezelés.',
  category: 'tutorial-step',
  tags: ['token', 'storage', 'security'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's4-nav',
      label: 'Token tárolás',
      action: { type: 'click', selector: '.step-nav button:nth-child(4)' },
      delayAfter: 600,
      tooltip: {
        title: 'Token tárolás stratégia',
        content: 'A token tárolás a webes biztonság egyik legvitatottabb kérdése. Három fő opció: localStorage (XSS-nek kitett), HttpOnly cookie (CSRF-nek kitett), memória (elvész refresh-re). Mi a memória + localStorage kombót használjuk, amely az XSS kockázatot minimalizálja a refresh token limitált felhasználásával.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's4-intro',
      label: 'Bevezető',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Token tárolás',
        content: 'Az OWASP ajánlása szerint a tokenek tárolási helye a legnagyobb sebezhetőségi pont SPA-kban. A legbiztonságosabb a HttpOnly cookie lenne (JavaScript nem éri el), de az SameSite/CORS beállításokkal bonyolódik cross-origin esetén. A mi megoldásunk jó kompromisszum fejlesztési környezetben.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's4-access',
      label: 'Access token – memória',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'Access token – memóriában',
        content: 'A memóriában tárolt token XSS-nél azért biztonságosabb, mert a támadónak le kell futtatnia JavaScript-et PONTOSAN a megfelelő pillanatban, és ismernie kell a signal referenciáját. A localStorage-ból bármikor, bármilyen script kiolvashatja. Fontos: a memória-tárolás NEM véd 100%-ban XSS ellen – a legjobb védelem maga az XSS megelőzése.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's4-code',
      label: 'TokenStorageService kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .code-block' },
      tooltip: {
        title: 'TokenStorageService',
        content: 'A TokenStorageService egy „facade" pattern: elfedi a komplex tárolási logikát egyszerű metódusokkal. A hívó kódnak nem kell tudnia, hogy az access token memóriában, a refresh token localStorage-ban van. Ez lehetővé teszi, hogy később változtassunk a stratégián (pl. HttpOnly cookie) a hívó kód módosítása nélkül.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's4-refresh',
      label: 'Refresh token – localStorage',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Refresh token – localStorage',
        content: 'A refresh token localStorage-ban biztonsági kockázat, de korlátozott: csak egyetlen endpointon (/auth/refresh) használható, és token rotation miatt egyszeri. Ha egy XSS támadó kiolvassa, egyszer használhatja – utána a jogos user tokenje érvénytelenné válik és észreveszi a kompromittálást.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's4-expiry',
      label: 'Lejárat kezelése',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'Lejárat kezelése',
        content: 'Az 5 perces küszöb (isTokenExpiringSoon) proaktív frissítést tesz lehetővé: mielőtt lejárna a token, frissítjük – így a felhasználó nem kap 401-et és nem veszi észre az átmenetet. A computed signal reaktív: amint Date.now() átlépi a küszöböt, hasValidToken automatikusan false-ra vált.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's4-why',
      label: 'Miért nem localStorage?',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'Miért nem localStorage az access token?',
        content: 'XSS esetén a támadó tetszőleges JavaScript-et futtat az oldalunkon. A localStorage.getItem() egyetlen sor – az access token azonnal kilopható lenne. De a LEGJOBB védelem az XSS megelőzése: az Angular automatikusan sanitizálja a template-eket, és SOHA ne használjunk bypassSecurityTrust*() metódusokat!',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 5. Auth Interceptor
// ═══════════════════════════════════════════════════
const step5Script: DemoScript = {
  id: 'tutorial-step-5',
  name: '5. Auth Interceptor',
  description: 'Bearer token csatolás, 401 kezelés, token frissítés az interceptorban.',
  category: 'tutorial-step',
  tags: ['interceptor', 'bearer', 'token'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's5-nav',
      label: 'Auth Interceptor',
      action: { type: 'click', selector: '.step-nav button:nth-child(5)' },
      delayAfter: 600,
      tooltip: {
        title: 'Auth Interceptor',
        content: 'Az interceptor a „Chain of Responsibility" tervezési minta Angular-megvalósítása. Gondolj rá úgy, mint egy reptéri biztonsági ellenőrzésre: minden utas (HTTP kérés) áthalad több állomáson (interceptorok), és mindegyik hozzáad vagy ellenőriz valamit, mielőtt a cél (szerver) felé indulhat.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's5-concept',
      label: 'Miért interceptor?',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Miért interceptor?',
        content: 'Ez a „Separation of Concerns" (felelősségek szétválasztása) elv: a ProductService felelőssége a termék CRUD, nem az autentikáció. Ha holnap OAuth2-re váltanánk JWT-ről, csak az interceptort kellene módosítani – a ProductService kódja változatlan maradna.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's5-code',
      label: 'Interceptor kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .code-block' },
      tooltip: {
        title: 'authInterceptor kód',
        content: 'A funkcionális interceptor (HttpInterceptorFn) az Angular modern megközelítése – korábban class-alapú volt. A funkcionális verzió tömörebb és tree-shakeable. A catchError → switchMap → next(newReq) lánc az „interceptor retry" minta: a hívó kód (pl. ProductService) észre sem veszi a háttérben történő token frissítést.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's5-excluded',
      label: 'Kizárt URL-ek',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'Kizárt URL-ek',
        content: 'Az excludedUrls.some(url => req.url.includes(url)) string-tartalom vizsgálatot használ. A login és register kizárt, mert ezekhez még nincs token – a refresh azért, mert pont újat kérünk. Odafigyelést igényel: ha lenne egy /auth/refreshSettings endpoint, az is kizáródna! Produkciós kódban pontosabb URL-egyeztetés ajánlott.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's5-attach',
      label: 'Token csatolás',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Token csatolás',
        content: 'Az immutability (megváltoztathatatlanság) az Angular HTTP rendszer tudatos döntése: a req nem módosítható közvetlenül, clone() kell. Ez megelőzi a race condition hibákat, amikor több interceptor egyszerre módosítaná a kérést. A „Bearer" prefix az OAuth 2.0 szabvány része (RFC 6750) – a szerver ebből tudja, hogy JWT token következik.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's5-401',
      label: '401 kezelés',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: '401 Unauthorized kezelés',
        content: 'A végtelen ciklus megelőzése kritikus: ha a refresh endpoint is 401-et adna (pl. lejárt refresh token), és az interceptor újra refresh-elne → újabb 401 → végtelen loop. A !req.url.includes(\'/auth/refresh\') feltétel ezt töri meg. Az isRefreshing flag pedig a párhuzamos 401-ekre indított dupla refresh-t akadályozza meg.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 6. CSRF védelem
// ═══════════════════════════════════════════════════
const step6Script: DemoScript = {
  id: 'tutorial-step-6',
  name: '6. CSRF védelem',
  description: 'CSRF támadás, XSRF-TOKEN cookie, custom interceptor cross-origin esetén.',
  category: 'tutorial-step',
  tags: ['csrf', 'xsrf', 'security'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's6-nav',
      label: 'CSRF védelem',
      action: { type: 'click', selector: '.step-nav button:nth-child(6)' },
      delayAfter: 600,
      tooltip: {
        title: 'CSRF védelem',
        content: 'A CSRF az egyik legrejtettebb webes támadás: a felhasználó semmit nem vesz észre belőle. A védelem (double-submit cookie pattern) elegáns: a szerver kiállít egy random tokent, és megkérdezi: „Tudod-e visszamondani?". A rosszindulatú oldal a Same-Origin Policy miatt nem tudja kiolvasni más domain cookie-jait.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's6-intro',
      label: 'CSRF definíció',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Mi az a CSRF?',
        content: 'A CSRF kihasználja a böngészők alapvető működését: bármilyen domain-ról indított kéréshez automatikusan mellékeli a cél-domain cookie-jait. Ez eredetileg feature (cross-site kérések működjenek), de támadási felületet nyit. A SameSite cookie attribútum (Lax/Strict) modern védelmet ad, de cross-origin API-knál a token-alapú védelem is szükséges.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's6-attack',
      label: 'Támadás példa',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'CSRF támadás példa',
        content: 'Konkrét példa: a user bejelentkezik a webshopba. Ezután megnyit egy „ingyenes nyeremény" oldalt, ami tartalmaz egy rejtett <form>-ot ami automatikusan POST-ol a mi API-nkra. A böngésző mellékeli a session cookie-t → a szerver jogosnak hiszi. Ezért fontos: GET kérés SOHA ne módosítson adatot (REST konvenció)!',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's6-defense',
      label: 'Védekezés',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Hogyan védekezünk?',
        content: 'Ez a „double-submit cookie" minta: a szerver egy random tokent állít cookie-ként. A kliens JavaScript-tel kiolvassa és HEADER-ként visszaküldi. A szerver összehasonlítja a kettőt. Miért működik? A támadó oldal tud POST-olni (form-mal), de NEM tudja kiolvasni más domain cookie-jait JavaScript-tel → nem tudja beállítani a headert. A 419 Laravel-specifikus „CSRF Token Mismatch" kód.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's6-code-interceptor',
      label: 'xsrfInterceptor kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .code-block' },
      tooltip: {
        title: 'xsrfInterceptor kód',
        content: 'Az interceptor sorrend kritikus: a xsrfInterceptor ELSŐ, mert a CSRF headert MINDEN módosító kéréshez hozzá kell adni – beleértve az auth refresh-t is. A getCookie() manuálisan parse-olja a document.cookie string-et (split → trim → split) – azért kell, mert nincs natív cookie-reading API a böngészőben.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's6-why-custom',
      label: 'Miért custom interceptor?',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'Miért kell egyedi interceptor?',
        content: 'A same-origin = azonos protokoll + domain + port. A localhost:4200 és localhost:8000 különböző PORT → cross-origin → az Angular beépített XSRF nem működik. Produkciós környezetben (ha azonos domainre deployolunk, pl. api.example.com és example.com) az Angular beépített megoldása használható és a custom interceptor elhagyható.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's6-code-csrf',
      label: 'getCsrfCookie() kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .code-block' },
      tooltip: {
        title: 'getCsrfCookie() használat',
        content: 'A withCredentials: true az XMLHttpRequest/Fetch opció, ami engedélyezi a cross-origin cookie küldést és fogadást. Nélküle a böngésző CORS policy szerint eldobja a Set-Cookie headert. A Laravel oldalon ehhez szükséges: cors.php-ben supports_credentials: true és Access-Control-Allow-Credentials: true response header.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's6-how',
      label: 'Interceptor működése',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'Interceptor működése',
        content: 'A GET-hez nem kell CSRF védelem, mert a REST konvenció szerint GET „safe method" – nem módosít adatot. A document.cookie API csak NEM HttpOnly cookie-kat olvas. A Laravel szándékosan NEM HttpOnly-ként állítja be az XSRF-TOKEN-t, hogy a JavaScript olvashassa. A decodeURIComponent() szükséges, mert a Laravel URL-kódolja a speciális karaktereket.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 7. Route guardok
// ═══════════════════════════════════════════════════
const step7Script: DemoScript = {
  id: 'tutorial-step-7',
  name: '7. Route guardok',
  description: 'authGuard, guestGuard, editorGuard, adminGuard – útvonalvédelem.',
  category: 'tutorial-step',
  tags: ['guard', 'route', 'protection'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's7-nav',
      label: 'Route guardok',
      action: { type: 'click', selector: '.step-nav button:nth-child(7)' },
      delayAfter: 600,
      tooltip: {
        title: 'Route guardok',
        content: 'A guardok UX védelmet adnak: megakadályozzák, hogy a felhasználó olyan oldalra navigáljon, ahol hibát kapna. De SOHA ne tekintsük biztonsági védelemnek: bárki megnyithatja a DevTools-t és közvetlenül hívhatja az API-t. A VALÓDI biztonság mindig a szerveren van (auth:sanctum middleware).',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's7-overview',
      label: '4 guard áttekintés',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: '4 guard a projektben',
        content: 'A CanActivateFn szinkron vagy aszinkron (Observable/Promise) lehet. A mi guard-jaink szinkronok, mert a signal-ek azonnal adnak értéket. Ha a guard Observable-t adna vissza, a Router megvárná – hasznos lenne pl. szerver oldali jogosultság-ellenőrzésnél, ahol HTTP kérés kellene.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's7-auth',
      label: 'authGuard',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'authGuard – bejelentkezés szükséges',
        content: 'A returnUrl a „redirect after login" UX probléma megoldása: a user /products-ot akarta → authGuard /login?returnUrl=%2Fproducts-ra irányít → login után visszanavigál. A state.url az Angular Router által biztosított aktuális cél URL – a guard CanActivateFn második argumentumaként kapja.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's7-code-auth',
      label: 'authGuard + guestGuard kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .code-block' },
      tooltip: {
        title: 'authGuard + guestGuard kód',
        content: 'A funkcionális guard (CanActivateFn) az Angular modern megközelítése – korábban class-alapú volt (@Injectable CanActivate interface). A funkcionális verzió tömörebb és tree-shakeable. Az inject() a guard-ban is működik, mert az Angular injection context-ben hívja meg.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's7-guest',
      label: 'guestGuard',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'guestGuard – csak vendégeknek',
        content: 'A guestGuard UX szempontból fontos: ha a bejelentkezett user kézzel beírja a /login URL-t, átirányítjuk /home-ra ahelyett, hogy felesleges login form-ot mutatnánk. Ezzel megelőzzük a „dupla bejelentkezés" helyzetet. Hasonló mintát használnak a nagy szolgáltatások (Google, GitHub) is.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's7-role',
      label: 'editorGuard + adminGuard',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'editorGuard + adminGuard',
        content: 'A role hierarchia implicit: az ADMIN átmegy az editorGuard-on is (role === \'EDITOR\' || \'ADMIN\'). Ha újabb role-t adnánk hozzá (pl. MODERATOR), módosítani kellene a guard-ot. Nagyobb rendszereknél permission-alapú rendszert használnak (pl. canEditProducts jogosultságok), ami rugalmasabb.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's7-code-role',
      label: 'editorGuard + adminGuard kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .code-block' },
      tooltip: {
        title: 'editorGuard + adminGuard kód',
        content: 'A user?.role optional chaining (ES2020) nullsafe hozzáférés: ha a user null/undefined, short-circuit-tel undefined-ot ad TypeError helyett. Elméletileg az authGuard után már van user, de a defenzív programozás véd a váratlan edge case-ek ellen.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's7-chain',
      label: 'Guard láncolás',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'Guard láncolás',
        content: 'A guard láncolás „short-circuit" logikával működik: ha az authGuard false-t ad (nincs bejelentkezve), az editorGuard már nem is fut le – felesleges lenne role-t ellenőrizni. A sorrend tehát fontos: először az általánosabb (authGuard), majd a specifikusabb (editorGuard). Ez hatékonyabb és logikusabb hibaüzeneteket is biztosít.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's7-code-routes',
      label: 'Routes konfiguráció kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .code-block' },
      tooltip: {
        title: 'Routes konfiguráció',
        content: 'A loadComponent + dynamic import() lazy loading minta: a LoginComponent kódja CSAK akkor töltődik le a böngészőbe, ha a user a /login URL-re navigál. Ez csökkenti az initial bundle méretet – a felhasználó gyorsabban látja az első oldalt. A .then(m => m.LoginComponent) a dinamikusan betöltött chunk-ból kéri ki a komponenst.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .code-block', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 8. Szerepkör-alapú jogosultság
// ═══════════════════════════════════════════════════
const step8Script: DemoScript = {
  id: 'tutorial-step-8',
  name: '8. Szerepkörök (RBAC)',
  description: 'Kliens computed signal-ek, template @if, szerver role middleware.',
  category: 'tutorial-step',
  tags: ['rbac', 'role', 'middleware'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's8-nav',
      label: 'Szerepkörök (RBAC)',
      action: { type: 'click', selector: '.step-nav button:nth-child(8)' },
      delayAfter: 600,
      tooltip: {
        title: 'Szerepkörök (RBAC)',
        content: 'Az RBAC (Role-Based Access Control) az egyik legelterjedtebb jogosultságkezelési modell. A „defense in depth" (mélységi védelem) elve: MINDEN rétegen ellenőrzünk – UI szinten (gombok elrejtése), route szinten (guard), és API szinten (middleware). Ha egy réteget megkerülnek, a következő még véd.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's8-intro',
      label: 'RBAC bevezető',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'RBAC – kettős védelem',
        content: 'A kliens oldali korlátozás (UI elemek elrejtése, guard-ok) csak UX célú: ne lássa a user amit nem kellene. De egy támadó Postman-ból vagy curl-lel közvetlenül hívhatja az API-t – ilyenkor CSAK a szerver middleware véd. Ezért a szerver oldali role ellenőrzés KÖTELEZŐ, a kliens oldali opcionális (de jó UX-hez szükséges).',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's8-roles',
      label: '3 szerepkör',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: '3 szerepkör',
        content: 'A 3 role hierarchia: USER ⊂ EDITOR ⊂ ADMIN. Biztonsági szempont: az ADMIN fiókot különösen kell védeni (erős jelszó, produkciós környezetben 2FA). A role a users táblában egyszerű string mező – nagyobb rendszereknél külön roles és user_roles pivot tábla szokásos (many-to-many) a rugalmasabb jogkezeléshez.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's8-client',
      label: 'Kliens megoldás',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Kliens oldali megoldás (Angular)',
        content: 'A computed() signal automatikus függőség-követéssel (dependency tracking) működik: a framework tudja, hogy isAdmin() a user() signal-től függ. Ha a user() változik, az isAdmin() is újraszámolódik és a template automatikusan frissül. Nincs szükség subscribe-ra – ez a signal-ek legnagyobb előnye a BehaviorSubject-hez képest.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's8-code-computed',
      label: 'Computed signal-ek kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .code-block:nth-child(2)' },
      tooltip: {
        title: 'Computed signal-ek',
        content: 'A computed() lazy: csak akkor számolódik újra, ha valaki olvassa ÉS a függőség változott. Ez performancia-előny: ha az @if(isAdmin()) blokk nem renderelődik, a computed nem fut feleslegesen. Összehasonlítva: a BehaviorSubject.pipe(map()) MINDIG lefut, függetlenül attól, hogy van-e subscriber.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .code-block:nth-child(2)', padding: 8, scrollIntoView: true }
    },
    {
      id: 's8-code-template',
      label: 'Feltételes template kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .code-block:nth-child(3)' },
      tooltip: {
        title: 'Template @if blokkok',
        content: 'Az @if() az Angular control flow szintaxis (Angular 17+): compile-time-ban optimalizált, a régi *ngIf direktívánál gyorsabb. Az @if(isAdmin()) NEM hozza létre a DOM elemet ha false – ez különbözik a CSS display:none-tól, ahol az elem a DOM-ban van (és a screen reader olvasná).',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .code-block:nth-child(3)', padding: 8, scrollIntoView: true }
    },
    {
      id: 's8-server',
      label: 'Szerver megoldás',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'Szerver oldali megoldás (Laravel)',
        content: 'A Laravel middleware a HTTP kérés feldolgozási láncban fut: Request → Middleware → Controller. Ha a middleware 403-at dob, a Controller SOHA nem fut le – az adat biztonságban van. A variadic ...$roles szintaxis lehetővé teszi, hogy egy middleware rugalmasan kezeljen több role-t (role:EDITOR,ADMIN).',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's8-code-middleware',
      label: 'Laravel middleware kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .code-block' },
      tooltip: {
        title: 'Laravel role middleware',
        content: 'A 401 (Unauthorized) és 403 (Forbidden) különbsége fontos: 401 = „nem tudjuk ki vagy" (nincs/érvénytelen token), 403 = „tudjuk ki vagy, de nincs jogod" (valid token, rossz role). A kliens ezeket külön kezelheti: 401-re login-ra irányít, 403-ra hibaüzenetet mutat. A middleware sorrend is számít: auth:sanctum ELŐSZÖR (401), utána role (403).',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .code-block', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 9. Token frissítés és hibakezelés
// ═══════════════════════════════════════════════════
const step9Script: DemoScript = {
  id: 'tutorial-step-9',
  name: '9. Token frissítés',
  description: 'Refresh token flow, token rotation, globális error interceptor.',
  category: 'tutorial-step',
  tags: ['refresh', 'token', 'error'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's9-nav',
      label: 'Token frissítés',
      action: { type: 'click', selector: '.step-nav button:nth-child(9)' },
      delayAfter: 600,
      tooltip: {
        title: 'Token frissítés',
        content: 'A „silent refresh" UX minta: a felhasználó folyamatosan használja az appot, és nem veszi észre, hogy a háttérben a token lejárt és megújult. Olyan, mint egy automatikus ajtónyitó: nem kell megállnod és beírni a kódot. Ha a refresh is sikertelen, AKKOR kérjük újra a jelszót.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's9-intro',
      label: 'Bevezető',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Token frissítés bevezető',
        content: 'A rövid access + hosszú refresh token minta biztonsági kompromisszum: ha az access tokent ellopják, max 60 percig használható. Ha a refresh tokent lopják el, a token rotation csökkenti a kockázatot. A legbiztonságosabb az lenne, ha minden kéréshez jelszót kérnénk – de az használhatatlan UX lenne.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's9-flow-1-2',
      label: 'Folyamat: 401 észlelés',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: '401 észlelés',
        content: 'A 401 kezelés a „transparent retry" minta az interceptorban. Az eredeti kérés „parkol" a catchError-ben: ha a refresh sikeres, switchMap()-pel újraindítjuk az új tokennel. A hívó kód (pl. ProductService) semmit nem tud erről – számára egyetlen API hívás történt, csak kicsit tovább tartott.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's9-flow-3-5',
      label: 'Folyamat: refresh + retry',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Refresh és újraküldés',
        content: 'Az isRefreshing flag race condition-t old meg: ha 3 párhuzamos API hívás egyszerre kapna 401-et, mindhárom megpróbálná refresh-elni. Token rotation miatt az első refresh érvénytelenítené a régi tokent, a másik kettő refresh meghiúsulna. A flag biztosítja, hogy csak egy refresh fut egyszerre.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's9-code-refresh',
      label: 'refreshToken() kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .code-block' },
      tooltip: {
        title: 'refreshToken() és logout() kód',
        content: 'A logout() kétlépcsős: 1) szerver oldali token revoke (POST /api/auth/logout) – a szerveren is érvénytelen legyen. 2) kliens oldali törlés (clearAuthState) – memória + localStorage. A catchError(() => clearAuthState) fontos: ha a szerver nem elérhető, a kliens akkor is kijelentkeztesse a felhasználót – ne maradjon „félig bejelentkezett" állapotban.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .code-block', padding: 8, scrollIntoView: true }
    },
    {
      id: 's9-rotation',
      label: 'Token rotation',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'Token rotation',
        content: 'A token rotation „poison pill" stratégia: ha a támadó használja az ellopott refresh tokent, a szerver újat ad (a támadónak) és revokolja a régit. Amikor a jogos user is refresh-elni próbál az (immár revoked) régi tokennel → 401 → kijelentkeztetve. Egyes rendszereknél ilyenkor az ÖSSZES refresh tokent revokálják (token family invalidation).',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's9-error',
      label: 'Error interceptor',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'Error interceptor',
        content: 'Az interceptor lánc szétválasztja a felelősségeket: a 401-et az auth interceptor kezeli (token refresh), a többit az error interceptor. A 0-ás hálózati hiba különösen fontos fejlesztés közben: jelzi, ha a Laravel szerver nem fut. Produkciós környezetben itt lehetne retry logikát (exponential backoff) vagy offline mode-ot implementálni.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's9-code-error',
      label: 'Error interceptor kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(5) > .code-block' },
      tooltip: {
        title: 'Error interceptor kód',
        content: 'A throwError() a „re-throw" minta: a globális interceptor loggol, de a hibát továbbdobja. Így a hívó service is kezelheti lokálisan (pl. ProductService megmutatja: „Termék mentése sikertelen"). Ha a throwError() nem lenne, a subscribe error callback-je nem futna le. Ez a „globális + lokális" hibakezelés kombinációja.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(5) > .code-block', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 10. Teljes rendszer áttekintés
// ═══════════════════════════════════════════════════
const step10Script: DemoScript = {
  id: 'tutorial-step-10',
  name: '10. Összefoglalás',
  description: 'Teljes kommunikációs diagram, biztonsági rétegek, interceptor sorrend.',
  category: 'tutorial-step',
  tags: ['summary', 'overview', 'config'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's10-nav',
      label: 'Összefoglalás',
      action: { type: 'click', selector: '.step-nav button:nth-child(10)' },
      delayAfter: 600,
      tooltip: {
        title: 'Összefoglalás',
        content: 'A 6 biztonsági réteg (CSRF, Bearer, middleware, guard, token rotation, jelszó hash) együttesen adja a „defense in depth" stratégiát. Egyetlen réteg sem elég önmagában, de együtt erős védelmet nyújtanak. Valós projektekben ehhez még jön: HTTPS, rate limiting, CORS policy, Content Security Policy.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's10-diagram',
      label: 'Kommunikációs diagram',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Kommunikációs folyamat',
        content: 'Ez a diagram a „happy path" (sikeres eset). A valóságban számos hiba-ág is van: hálózati hiba → retry, CSRF mismatch → 419, lejárt refresh token → logout, revoked token → logout, role hiba → 403. A robosztus rendszer MINDEGYIK esetet kezeli – ezért van 3 interceptor a láncban.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's10-security-1',
      label: 'Biztonsági rétegek (1-3)',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'Biztonsági rétegek (1-3)',
        content: 'Minden réteg más támadást véd: CSRF → cross-site form submission. Bearer → azonosítás nélküli hozzáférés. Role middleware → privilege escalation (jogosultság-kiterjesztés). Ha egy támadó CSRF-fel próbálkozik, a Bearer token hiánya is megállítja. A rétegek egymást erősítik.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's10-security-2',
      label: 'Biztonsági rétegek (4-6)',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Biztonsági rétegek (4-6)',
        content: 'A jelszó hash (bcrypt) a „data at rest" védelme: ha az adatbázist ellopják, a jelszavak nem olvashatók. A token rotation a „stolen credential" védelme: az ellopott token gyorsan érvénytelenné válik. A guard a UX réteg védelme. Mindezek összessége adja a komplex biztonsági modellt – valós rendszerek ennél is többet alkalmaznak (2FA, IP-based rate limiting).',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's10-order',
      label: 'Interceptor sorrend',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'Interceptor sorrend',
        content: 'A „middleware pipeline" mintában a sorrend a működést határozza meg. Ha az errorInterceptor lenne első: elkapná a 401-et mielőtt az authInterceptor refresh-elhetne. Ha az authInterceptor lenne első: a CSRF token hiányozna a refresh POST-ból → 419 hiba. Produkciós rendszerekben további interceptorok is lehetnek: logging, caching, retry.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's10-code',
      label: 'app.config.ts kód',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(4) > .code-block' },
      tooltip: {
        title: 'app.config.ts',
        content: 'Az ApplicationConfig az Angular standalone architecture központja (NgModule nélkül). A provideHttpClient() és withInterceptors() a „composition over inheritance" elv: konfigurálható részekből építjük a rendszert. Az APP_INITIALIZER biztosítja, hogy az auth állapot helyreálljon (refresh) mielőtt bármi renderelődne – így a guard-ok helyes user állapotot látnak.',
        position: 'top',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(4) > .code-block', padding: 8, scrollIntoView: true }
    }
  ]
};

// ═══════════════════════════════════════════════════
// 11. Kiegészítő fogalmak
// ═══════════════════════════════════════════════════
const step11Script: DemoScript = {
  id: 'tutorial-step-11',
  name: '11. Kiegészítő fogalmak',
  description: 'Salting, Brute force, XSS, CSRF, Token Rotation – biztonsági fogalmak részletesen.',
  category: 'tutorial-step',
  tags: ['salting', 'brute-force', 'csrf', 'xss', 'security'],
  setup: { initialRoute: '/tutorial' },
  steps: [
    {
      id: 's11-nav',
      label: 'Kiegészítő fogalmak',
      action: { type: 'click', selector: '.step-nav button:nth-child(11)' },
      delayAfter: 600,
      tooltip: {
        title: 'Kiegészítő fogalmak',
        content: 'Ezen az oldalon a korábbi fejezetekben említett biztonsági fogalmakat fejtjük ki részletesen. 3 tabulátorba rendezve: Jelszóvédelem, Bejelentkezés-védelem és Webes támadások – összesen 13 fogalom, amelyek együtt adják a „defense in depth" stratégiát.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    // Intro
    {
      id: 's11-intro',
      label: 'Bevezető',
      action: { type: 'highlight', selector: '.step-body > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Kiegészítő fogalmak',
        content: 'A JWT rendszer több biztonsági réteget alkalmaz. A jelszóvédelem (Salting, Rainbow Table, Brute Force, Timing Attack), a bejelentkezés-védelem (Rate Limiting, CAPTCHA, 2FA), és a webes támadások elleni védelem (XSS, CSRF, Token Rotation) együtt adják a „defense in depth" stratégiát. A színek jelölik: piros = támadás, kék = védelem, zöld = alapfogalom.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.step-body > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    // === Tab 0: Jelszóvédelem ===
    {
      id: 's11-tab-jelszo',
      label: 'Jelszóvédelem tab',
      action: { type: 'click', selector: '.tab-nav button:nth-child(1)' },
      delayAfter: 400,
      tooltip: {
        title: 'Jelszóvédelem',
        content: 'Ez a tabulátor a jelszó hash-eléshez kapcsolódó támadásokat és védelmi technikákat tartalmazza: Salting, Rainbow Table, Brute Force, Credential Stuffing és Timing Attack.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's11-salting',
      label: 'Salting (sózás)',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Salting (sózás)',
        content: 'A salt egy véletlenszerű karaktersorozat, amit a jelszóhoz fűznek hash-elés előtt. A bcrypt automatikusan generálja és a hash-ben tárolja (a $2y$10$ utáni első 22 karakter). Miért fontos? Salt nélkül két azonos jelszó (pl. „password123") azonos hash-t kapna → a támadó rainbow table-ből azonnal visszafejti. Salt-tal minden hash egyedi, még azonos jelszavaknál is.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-rainbow-table',
      label: 'Rainbow table',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'Rainbow table (Szivárványtábla)',
        content: 'A rainbow table egy hatalmas, előre kiszámított jelszó→hash adatbázis. A támadó nem számol, csak keres – ha a hash benne van a táblában, azonnal megvan a jelszó. Ezért fontos a salt: minden salt-hoz külön táblát kellene generálni, ami a jelenlegi tárolókapacitás mellett gyakorlatilag lehetetlen. A bcrypt automatikus salt-olása pont ezt a támadást teszi hatástalanná.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-brute-force',
      label: 'Brute force (nyers erő)',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'Brute force (nyers erő)',
        content: 'A brute force ellen a bcrypt a fő védelmi vonal: szándékosan lassú (~200 ms/hash), így másodpercenként max 5 próbálkozás lehetséges, szemben az MD5 millióival. Kiegészítő védelmek: rate limiting (max 5 próba/perc/IP), account lockout (10 sikertelen → zárolás), CAPTCHA (bot-védelem). A jelszó hossza exponenciálisan növeli a próbálkozások számát: 8 karakter (a-z, A-Z, 0-9) = 62⁸ ≈ 218 billió kombináció.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-credential-stuffing',
      label: 'Credential Stuffing',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'Credential Stuffing',
        content: 'A credential stuffing a brute force „okosabb" változata: nem random kombinációkat próbál, hanem valós, kiszivárgott jelszavakat. Ezért sokkal hatékonyabb – a felhasználók ~65%-a ugyanazt a jelszót használja több helyen. Ellene a 2FA a legerősebb védelem: még ha a jelszó kiszivárog, a második faktor (SMS, authenticator app) nélkül nem lehet belépni.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-timing-attack',
      label: 'Timing Attack',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'Timing Attack (Időzítési támadás)',
        content: 'A timing attack a szerver válaszidejéből nyer ki információt. Ha a jelszó-összehasonlítás karakter-by-karakter történik és az első hibánál megáll, a válaszidőből kitalálható, hány karakter egyezik. A védekezés: constant-time comparison (hash_equals), amely MINDIG ugyanannyi ideig fut. A bcrypt természetéből adódóan is véd, mert a hash-t hasonlítja, nem az eredeti jelszót.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    },
    // === Tab 1: Bejelentkezés-védelem ===
    {
      id: 's11-tab-login',
      label: 'Bejelentkezés-védelem tab',
      action: { type: 'click', selector: '.tab-nav button:nth-child(2)' },
      delayAfter: 400,
      tooltip: {
        title: 'Bejelentkezés-védelem',
        content: 'Ez a tabulátor a bejelentkezés védelmi eszközeit tartalmazza: Rate Limiting (kéréskorlátozás), CAPTCHA (bot-védelem) és 2FA (kétfaktoros hitelesítés).',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's11-rate-limiting',
      label: 'Rate Limiting',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'Rate Limiting (Kéréskorlátozás)',
        content: 'A rate limiting korlátozza az adott IP-ről érkező kérések számát (pl. max 5 login/perc). A szerver 429 Too Many Requests-szel válaszol túllépéskor. Korlátja: elosztott támadásnál (botnet) minden IP alatta marad a limitnek – ezért kell kiegészíteni CAPTCHA-val. A Laravel ThrottleRequests middleware automatikusan kezeli, és X-RateLimit-* fejlécekben jelzi a limitet.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-captcha',
      label: 'CAPTCHA',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'CAPTCHA',
        content: 'A CAPTCHA a brute force elleni védelem fontos kiegészítője. A rate limiting IP-cím alapján korlátoz, de egy támadó több IP-ről is próbálkozhat (botnet). A CAPTCHA biztosítja, hogy EMBER próbálkozik. A reCAPTCHA v3 a legmodernebb: láthatatlanul fut a háttérben, és 0.0–1.0 kockázati pontszámot ad – a szerver eldönti, milyen küszöbérték felett enged tovább. Így a jogos felhasználók nem is észlelik a védelmet.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-2fa',
      label: '2FA (Kétfaktoros hitelesítés)',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: '2FA (Kétfaktoros hitelesítés)',
        content: 'A 2FA két különböző típusú azonosítást követel: valami amit TUDSZ (jelszó) + valami ami NÁLAD VAN (telefon) vagy ami TE VAGY (ujjlenyomat). A TOTP (Google Authenticator) biztonságosabb az SMS-nél (SIM-swap támadás), de a WebAuthn/Passkey a legbiztonságosabb – phishing-rezisztens, mert a böngésző ellenőrzi a domaint. A credential stuffing ellen a 2FA a legerősebb védelem.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    // === Tab 2: Webes támadások ===
    {
      id: 's11-tab-web',
      label: 'Webes támadások tab',
      action: { type: 'click', selector: '.tab-nav button:nth-child(3)' },
      delayAfter: 400,
      tooltip: {
        title: 'Webes támadások',
        content: 'Ez a tabulátor a webes támadásokat és token-védelmet tartalmazza: XSS, CSRF (támadás és védekezés), Token Rotation és SHA-256.',
        position: 'bottom',
        requireConfirm: true
      }
    },
    {
      id: 's11-xss',
      label: 'XSS (Cross-Site Scripting)',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(1) > .content-item' },
      tooltip: {
        title: 'XSS (Cross-Site Scripting)',
        content: 'Az XSS a token-lopás fő vektora: ha a támadó JavaScript-et futtat az oldalunkon, hozzáfér a localStorage-hoz (egy sor kód: localStorage.getItem). Ezért tároljuk az access tokent memóriában, NEM localStorage-ban. Az Angular automatikus sanitizáció véd: a template-ekben a <script> tag szövegként jelenik meg. SOHA ne használjunk bypassSecurityTrust*() metódusokat felhasználói adatokkal!',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(1) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-csrf-attack',
      label: 'CSRF támadás',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(2) > .content-item' },
      tooltip: {
        title: 'CSRF cookie – Mi a CSRF támadás?',
        content: 'A CSRF (Cross-Site Request Forgery) kihasználja, hogy a böngésző AUTOMATIKUSAN elküldi a cookie-kat minden kéréshez. A támadó oldaláról indított kérés is megkapja a session cookie-t → a szerver nem tudja megkülönböztetni a jogos és rosszindulatú kérést. A „double-submit cookie" minta ezt oldja meg: a szerver ad egy tokent, amit a kliens kódnak AKTÍVAN vissza kell küldenie headerben – ezt a támadó nem tudja megtenni.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(2) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-csrf-flow',
      label: 'CSRF a login flow-ban',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(3) > .content-item' },
      tooltip: {
        title: 'CSRF cookie a login flow-ban',
        content: 'A login előtti GET /sanctum/csrf-cookie kérés azért kell, mert a kliens ezzel szerzi be a CSRF tokent. A szerver cookie-ban küldi (XSRF-TOKEN), a kliens JavaScripttel kiolvassa és X-XSRF-TOKEN headerként csatolja a POST-hoz. A same-origin policy miatt a támadó oldal nem tudja kiolvasni más domain cookie-ját → nem tudja a headert beállítani → a szerver elutasítja. Ez a kétfaktoros ellenőrzés lényege.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(3) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-token-rotation',
      label: 'Token Rotation',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(4) > .content-item' },
      tooltip: {
        title: 'Token Rotation (Token forgatás)',
        content: 'A token rotation biztosítja, hogy a refresh token egyszeri használatú: minden refresh-nél újat kap a kliens, a régit a szerver érvényteleníti. A „poison pill" mechanizmus: ha a támadó használja az ellopott tokent → a jogos user tokenje érvénytelenné válik → a szerver észleli az újrahasználatot → az ÖSSZES tokent revokolja. A projektünkben a Laravel Sanctum SHA-256-tal hash-eli a refresh tokent az adatbázisban.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(4) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-sha256',
      label: 'SHA-256',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(5) > .content-item' },
      tooltip: {
        title: 'SHA-256 (Secure Hash Algorithm)',
        content: 'A SHA-256 egyirányú hash: az adatból fix méretű lenyomatot készít, amiből NEM lehet visszafejteni az eredetit. Fontos különbség: a SHA-256 gyors (tokenekhez jó), a bcrypt szándékosan lassú (jelszavakhoz kell). A projektünkben a JWT aláírás HMAC-SHA256-ot használ, a refresh tokent SHA-256-tal hash-elik az adatbázisban, a jelszavakat pedig bcrypt-tel.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(5) > .content-item', padding: 8, scrollIntoView: true }
    },
    {
      id: 's11-hmac',
      label: 'HMAC',
      action: { type: 'highlight', selector: '.tab-panel > .section:nth-child(6) > .content-item' },
      tooltip: {
        title: 'HMAC (Hash-based Message Authentication Code)',
        content: 'Az HMAC egy titkos kulccsal kombinált hash: nem csak az adat sértetlenségét, hanem a feladó hitelességét is garantálja. A sima SHA-256 bárki számára kiszámítható, az HMAC-hez viszont kell a titkos kulcs. A JWT HS256 algoritmusa pontosan HMAC-SHA256-ot használ: a header+payload-ot a szerver titkos kulcsával írja alá, így a kliens nem tudja hamisítani a tokent.',
        position: 'right',
        requireConfirm: true
      },
      highlight: { selector: '.tab-panel > .section:nth-child(6) > .content-item', padding: 8, scrollIntoView: true }
    }
  ]
};

export const tutorialStepScripts: DemoScript[] = [
  step1Script, step2Script, step3Script, step4Script, step5Script,
  step6Script, step7Script, step8Script, step9Script, step10Script,
  step11Script
];
