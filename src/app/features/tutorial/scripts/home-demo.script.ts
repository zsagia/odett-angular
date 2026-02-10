import { DemoScript } from '@zssz-soft/demo-autopilot-core';

export const homeDemoScript: DemoScript = {
  id: 'home-demo',
  name: 'Főoldal',
  description: 'A főoldal felépítése: bejelentkezett állapot, role-alapú navigáció, computed signal-ek.',
  category: 'home',
  tags: ['home', 'role', 'signals', 'angular'],

  setup: {
    initialRoute: '/home'
  },

  steps: [
    {
      id: 'home-card',
      label: 'Főoldal kártya',
      action: { type: 'highlight', selector: '.home-card' },
      tooltip: {
        title: 'Bejelentkezett állapot',
        content: 'A felhasználó sikeresen bejelentkezett. A szerver visszaadta az access tokent (JWT) és a refresh tokent.\n\n• Access token → memóriában (signal)\n• Refresh token → localStorage-ban\n\nAz authGuard engedélyezte a /home útvonalat, mert az AuthService.isAuthenticated() signal true.',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '.home-card',
        padding: 12,
        scrollIntoView: true
      }
    },
    {
      id: 'user-info',
      label: 'Felhasználó adatok',
      action: { type: 'highlight', selector: '.user-info' },
      tooltip: {
        title: 'Felhasználó adatai (Signal)',
        content: 'A felhasználó neve és szerepköre az AuthService.user() signal-jéből jön.\n\nA login válaszban a szerver visszaadja a user objektumot:\n{ id, name, email, role }\n\nA template a user()?.name és user()?.role kifejezésekkel olvassa ki. A ?. (optional chaining) véd a null ellen.',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '.user-info',
        padding: 8
      }
    },
    {
      id: 'role-badge',
      label: 'Szerepkör badge',
      action: { type: 'highlight', selector: '.role-badge' },
      tooltip: {
        title: 'Szerepkör (Role)',
        content: 'A role mező határozza meg a jogosultságokat:\n\n• ADMIN → mindent lát és kezel\n• EDITOR → termékeket kezelhet\n• USER → csak a kijelentkezés és tutorial gombokat látja\n\nA role értéke a szerver users táblájából jön. Kliens oldalon computed() signal-ekkel van kiszámolva: isAdmin(), isEditorOrAdmin().',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '.role-badge',
        padding: 6
      }
    },
    {
      id: 'nav-links',
      label: 'Feltételes navigáció',
      action: { type: 'highlight', selector: '.nav-links' },
      tooltip: {
        title: 'Feltételes megjelenítés (@if)',
        content: 'A gombok @if blokkokkal vannak vezérelve:\n\n• @if (isAdmin()) → Felhasználók gomb\n• @if (isEditorOrAdmin()) → Termékek gomb\n• JWT Órai anyag → mindenki látja\n\nEzek computed() signal-ek, amelyek a user().role értékét vizsgálják. Ha a role változik, a UI automatikusan frissül.',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '.nav-links',
        padding: 8
      }
    },
    {
      id: 'logout-btn',
      label: 'Kijelentkezés',
      action: { type: 'highlight', selector: '.logout-btn' },
      tooltip: {
        title: 'Kijelentkezés folyamata',
        content: 'Kattintáskor az AuthService.logout() fut le:\n\n1. POST /api/auth/logout kérés a szervernek\n2. Szerver: access token törlése\n3. Szerver: refresh tokenek visszavonása (revoked = true)\n4. Kliens: access token törlése a memóriából\n5. Kliens: refresh token törlése a localStorage-ból\n6. Router.navigate([\'/login\']) – átirányítás',
        position: 'top',
        requireConfirm: true
      },
      highlight: {
        selector: '.logout-btn',
        padding: 8
      }
    }
  ]
};
