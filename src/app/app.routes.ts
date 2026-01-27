import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

export const routes: Routes = [
  // Auth routes (csak vendegeknek)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },

  // Vedett utvonalak (bejelentkezes szukseges)
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: 'websocket-exam',
    loadComponent: () => import('./websocket-exam/websocket-exam').then(m => m.WebsocketExamComponent),
    canActivate: [authGuard]
  },

  // Default redirect
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
