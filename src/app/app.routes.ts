import { Routes } from '@angular/router';
import { authGuard, vendorGuard } from './guards';

export const routes: Routes = [
  { path: '', title: 'MarketHub | Shop from independent sellers', loadComponent: () => import('./pages/home').then(m => m.HomePage) },
  { path: 'shop', title: 'Shop | MarketHub', loadComponent: () => import('./pages/shop').then(m => m.ShopPage) },
  { path: 'product/:id', loadComponent: () => import('./pages/product').then(m => m.ProductPage) },
  { path: 'vendors', title: 'Sellers | MarketHub', loadComponent: () => import('./pages/vendors').then(m => m.VendorsPage) },
  { path: 'vendor/:id', loadComponent: () => import('./pages/vendors').then(m => m.VendorPage) },
  { path: 'cart', title: 'Your cart | MarketHub', loadComponent: () => import('./pages/cart').then(m => m.CartPage) },
  { path: 'checkout', title: 'Checkout | MarketHub', canActivate: [authGuard], loadComponent: () => import('./pages/cart').then(m => m.CheckoutPage) },
  { path: 'order/:id', title: 'Order placed | MarketHub', canActivate: [authGuard], loadComponent: () => import('./pages/cart').then(m => m.OrderDonePage) },
  { path: 'login', title: 'Sign in | MarketHub', loadComponent: () => import('./pages/auth').then(m => m.AuthPage), data: { mode: 'login' } },
  { path: 'register', title: 'Create account | MarketHub', loadComponent: () => import('./pages/auth').then(m => m.AuthPage), data: { mode: 'register' } },
  { path: 'account', title: 'My account | MarketHub', canActivate: [authGuard], loadComponent: () => import('./pages/account').then(m => m.AccountPage) },
  { path: 'seller', title: 'Seller dashboard | MarketHub', canActivate: [vendorGuard], loadComponent: () => import('./pages/dashboard').then(m => m.DashboardPage) },
  { path: '**', title: 'Not found | MarketHub', loadComponent: () => import('./pages/home').then(m => m.NotFoundPage) },
];
