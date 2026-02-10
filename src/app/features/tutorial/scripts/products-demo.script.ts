import { DemoScript } from '@zssz-soft/demo-autopilot-core';

export const productsDemoScript: DemoScript = {
  id: 'products-demo',
  name: 'Termékek oldal',
  description: 'A terméklista: Bearer token API hívás, CRUD műveletek, szerver oldali role middleware.',
  category: 'products',
  tags: ['products', 'crud', 'bearer', 'middleware'],

  setup: {
    initialRoute: '/products'
  },

  steps: [
    {
      id: 'products-header',
      label: 'Termékek fejléc',
      action: { type: 'wait', payload: { duration: 800 } },
      tooltip: {
        title: 'Termékek oldal – editorGuard',
        content: 'Ez az oldal csak EDITOR és ADMIN felhasználóknak érhető el.\n\nKét védelmi réteg:\n1. Kliens: editorGuard ellenőrzi a user.role-t\n2. Szerver: role:EDITOR,ADMIN middleware\n\nHa USER role-lal próbálnánk elérni → a guard átirányít a /home-ra.',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '.products-header',
        padding: 12,
        scrollIntoView: true
      }
    },
    {
      id: 'btn-add',
      label: 'Új termék gomb',
      action: { type: 'highlight', selector: '.btn-add' },
      tooltip: {
        title: 'Új termék létrehozása',
        content: 'Ez a gomb a /products/new oldalra navigál.\n\n• Csak akkor jelenik meg, ha canEdit() signal true (EDITOR/ADMIN)\n• Az @if (canEdit()) blokk vezérli a megjelenítést\n• A POST kéréshez CSRF token szükséges (xsrf interceptor)\n• A szerveren role:EDITOR,ADMIN middleware védi',
        position: 'bottom',
        requireConfirm: true
      },
      highlight: {
        selector: '.btn-add',
        padding: 8
      }
    },
    {
      id: 'products-table',
      label: 'Terméklista',
      action: { type: 'highlight', selector: '.products-table' },
      tooltip: {
        title: 'API hívás Bearer tokennel',
        content: 'A ProductService GET /api/products kérést küld.\n\nAz auth interceptor automatikusan hozzáadja:\nAuthorization: Bearer <access_token>\n\nA szerver Sanctum middleware-je:\n1. Dekódolja a JWT tokent\n2. Azonosítja a felhasználót\n3. Ha érvényes → visszaküldi a terméklistát\n4. Ha lejárt → 401 → auto refresh',
        position: 'top',
        requireConfirm: true
      },
      highlight: {
        selector: '.products-table',
        padding: 8,
        scrollIntoView: true
      }
    },
    {
      id: 'actions',
      label: 'CRUD műveletek',
      action: { type: 'highlight', selector: '.actions' },
      tooltip: {
        title: 'Szerkesztés / Törlés – szerver védelem',
        content: 'A Szerkesztés és Törlés gombok:\n\nKliens oldal:\n• canEdit() computed signal vezérli a megjelenítést\n• Csak EDITOR/ADMIN számára jelenik meg\n\nSzerver oldal:\n• PUT /api/products/{id} → role:EDITOR,ADMIN\n• DELETE /api/products/{id} → role:EDITOR,ADMIN\n\nHa valaki közvetlenül hívná az API-t → 403 Forbidden.',
        position: 'left',
        requireConfirm: true
      },
      highlight: {
        selector: '.actions',
        padding: 8
      }
    },
    {
      id: 'back-link',
      label: 'Vissza link',
      action: { type: 'highlight', selector: '.back-link' },
      tooltip: {
        title: 'Navigáció',
        content: 'A routerLink="/home" visszanavigál a főoldalra. Az Angular Router nem tölt újra az oldalt (SPA), csak a komponenst cseréli ki. A JWT token a memóriában marad.',
        position: 'top',
        requireConfirm: true
      },
      highlight: {
        selector: '.back-link',
        padding: 6
      }
    }
  ]
};
