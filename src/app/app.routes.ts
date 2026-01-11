import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat').then((m) => m.ChatComponent),
  },
];
