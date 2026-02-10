import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
