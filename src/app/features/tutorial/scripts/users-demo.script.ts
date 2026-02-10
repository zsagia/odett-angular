import { DemoScript } from '@zssz-soft/demo-autopilot-core';

export const usersDemoScript: DemoScript = {
  id: 'users-demo',
  name: 'Felhasználók oldal',
  description: 'Felhasználó kezelés: ADMIN-only hozzáférés, adminGuard, szerepkör módosítás.',
  category: 'users',
  tags: ['users', 'admin', 'guard', 'role'],

  setup: {
    initialRoute: '/users'
  },

  steps: [
    {
      id: 'users-header',
      label: 'Felhasználók fejléc',
      action: { type: 'wait', payload: { duration: 800 } },
      tooltip: {
        title: 'Felhasználók kezelés – ADMIN only',
        content: 'Ez az oldal kizárólag ADMIN felhasználóknak érhető el.\n\nVédelem:\n1. authGuard → bejelentkezés szükséges\n2. adminGuard → csak ADMIN role\n\nHa EDITOR vagy USER próbálná elérni:\n• A guard átirányít a /home oldalra\n• A szerveren a role:ADMIN middleware 403-at küld',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '.users-header',
        padding: 12,
        scrollIntoView: true
      }
    },
    {
      id: 'users-table',
      label: 'Felhasználó tábla',
      action: { type: 'highlight', selector: '.users-table' },
      tooltip: {
        title: 'Felhasználók listája – Bearer token',
        content: 'A UserService GET /api/users kérést küld.\n\nAz interceptor lánc:\n1. xsrfInterceptor → GET-hez nem kell CSRF\n2. authInterceptor → Bearer token csatolása\n3. errorInterceptor → hibakezelés\n\nA szerveren:\n• auth:sanctum middleware → azonosítás\n• role:ADMIN middleware → jogosultság ellenőrzés',
        position: 'top',
        requireConfirm: true
      },
      highlight: {
        selector: '.users-table',
        padding: 8,
        scrollIntoView: true
      }
    },
    {
      id: 'role-badges',
      label: 'Szerepkör badge-ek',
      action: { type: 'highlight', selector: '.users-table tbody' },
      tooltip: {
        title: 'Szerepkörök az adatbázisban',
        content: 'Minden felhasználónak van egy role mezője a users táblában:\n\n• ADMIN – piros badge – teljes hozzáférés\n• EDITOR – kék badge – termék kezelés\n• USER – szürke badge – alap felhasználó\n\nAz ADMIN módosíthatja más felhasználók szerepkörét a Szerkesztés gombbal.',
        position: 'top',
        requireConfirm: true
      },
      highlight: {
        selector: '.users-table tbody',
        padding: 4
      }
    },
    {
      id: 'edit-btn',
      label: 'Szerkesztés gomb',
      action: { type: 'highlight', selector: '.btn-edit' },
      tooltip: {
        title: 'Szerepkör módosítása',
        content: 'A Szerkesztés gomb a /users/:id/edit oldalra navigál.\n\nItt az ADMIN:\n• Módosíthatja a felhasználó nevét\n• Megváltoztathatja a szerepkörét (USER ↔ EDITOR ↔ ADMIN)\n\nA PATCH /api/users/{id} kérés:\n• Bearer token az Authorization headerben\n• CSRF token az X-XSRF-TOKEN headerben\n• role:ADMIN middleware a szerveren',
        position: 'left',
        requireConfirm: true
      },
      highlight: {
        selector: '.btn-edit',
        padding: 6
      }
    }
  ]
};
