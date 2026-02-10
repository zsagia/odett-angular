import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { editorGuard } from './core/auth/guards/editor.guard';

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

  // Termekek
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/new',
    loadComponent: () => import('./features/products/product-form/product-form').then(m => m.ProductFormComponent),
    canActivate: [authGuard, editorGuard]
  },
  {
    path: 'products/:id/edit',
    loadComponent: () => import('./features/products/product-form/product-form').then(m => m.ProductFormComponent),
    canActivate: [authGuard, editorGuard]
  },

  // Default redirect
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
