import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/connexion'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const user = authService.getCurrentUserSnapshot();

  if (user?.roles?.includes('ROLE_ADMIN')) {
    return true;
  }

  return router.createUrlTree(['/']);
}