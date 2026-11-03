import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StoreService } from './store.service';

export const authGuard: CanActivateFn = (_r, state) => {
  const s = inject(StoreService), r = inject(Router);
  if (s.user()) return true;
  s.toast('Sign in to continue', 'info');
  return r.createUrlTree(['/login'], { queryParams: { next: state.url } });
};
export const vendorGuard: CanActivateFn = () => {
  const s = inject(StoreService), r = inject(Router);
  if (s.isVendor()) return true;
  s.toast('Seller dashboard is for vendor accounts', 'info');
  return r.createUrlTree(s.user() ? ['/'] : ['/login'], s.user() ? {} : { queryParams: { next: '/seller' } });
};
