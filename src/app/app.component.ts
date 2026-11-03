import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService } from './store.service';

@Component({
  selector: 'app-root', standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
  <a class="skip" href="#main">Skip to content</a>
  <div class="announcement"><strong>A little something from every corner of India</strong>&nbsp; · &nbsp;Small makers, thoughtful finds, one easy checkout</div>
  <header class="topbar">
    <div class="container topbar-in">
      <a routerLink="/" class="logo" aria-label="MarketHub home"><span class="logo-mark" aria-hidden="true">✳</span>MarketHub</a>
      <form class="search" (submit)="search($event)" role="search">
        <input [(ngModel)]="q" name="q" type="search" placeholder="Find something lovely…" aria-label="Search products" list="suggest" autocomplete="off">
        <datalist id="suggest">@for (c of store.categories(); track c.id) { <option [value]="c.name"></option> }</datalist>
        <button class="btn" type="submit">Search <span aria-hidden="true">↗</span></button>
      </form>
      <nav class="nav" aria-label="Main">
        <a routerLink="/shop" routerLinkActive="active" class="nav-link hide-sm">Shop</a>
        <a routerLink="/vendors" routerLinkActive="active" class="nav-link hide-sm">Sellers</a>
        <a routerLink="/account" fragment="wishlist" class="nav-link" aria-label="Wishlist"><span class="nav-icon" aria-hidden="true">♡</span><span class="nav-label">Saved</span><sup class="count" [class.zero]="!store.wishlist().length">{{ store.wishlist().length }}</sup></a>
        <a routerLink="/cart" class="nav-link cart" aria-label="Cart"><span class="nav-icon" aria-hidden="true">🛍️</span><span class="nav-label">Bag</span><sup class="count" [class.zero]="!store.cartCount()">{{ store.cartCount() }}</sup></a>
        @if (store.user(); as u) {
          <div class="menu-wrap">
            <button class="btn btn-ghost" (click)="menu.set(!menu())" [attr.aria-expanded]="menu()">{{ u.name.split(' ')[0] }} <span aria-hidden="true">⌄</span></button>
            @if (menu()) {
              <div class="menu" role="menu" (click)="menu.set(false)">
                @if (u.role === 'vendor') { <a routerLink="/seller" role="menuitem">Seller dashboard</a> }
                <a routerLink="/account" role="menuitem">My orders</a>
                <button role="menuitem" (click)="store.logout()">Sign out</button>
              </div>
            }
          </div>
        } @else {
          <a routerLink="/login" class="btn btn-ghost">Sign in</a>
        }
      </nav>
    </div>
    <div class="container catbar">
      @for (c of store.categories(); track c.id) {
        <a [routerLink]="['/shop']" [queryParams]="{ cat: c.id }" class="catlink">{{ c.emoji }} {{ c.name }}</a>
      }
    </div>
  </header>

  <main id="main"><router-outlet /></main>

  <footer class="footer">
    <div class="container footer-in">
      <div>
        <a routerLink="/" class="logo"><span class="logo-mark" aria-hidden="true">✳</span>MarketHub</a>
        <p class="muted">A little corner of the internet for India’s independent makers, growers and good finds.</p>
      </div>
      <div><h4>Explore</h4><a routerLink="/shop">Shop everything</a><a routerLink="/vendors">Meet the sellers</a><a routerLink="/cart">Your bag</a></div>
      <div><h4>For makers</h4><a routerLink="/register" [queryParams]="{ role: 'vendor' }">Open a store</a><a routerLink="/seller">Seller dashboard</a></div>
      <div><h4>Just so you know</h4><p class="muted small">Demo shopping, saved securely in this browser.</p><button class="link-btn" (click)="store.resetDemo()">Reset demo data</button></div>
    </div>
  </footer>

  <div class="toasts" aria-live="polite">
    @for (t of store.toasts(); track t.id) {
      <div class="toast" [class.err]="t.kind === 'err'" [class.info]="t.kind === 'info'" (click)="store.dismissToast(t.id)">{{ t.text }}</div>
    }
  </div>`,
})
export class AppComponent {
  store = inject(StoreService);
  router = inject(Router);
  q = '';
  menu = signal(false);
  search(e: Event) {
    e.preventDefault();
    const q = this.q.trim();
    const cat = this.store.categories().find(c => c.name.toLowerCase() === q.toLowerCase());
    this.router.navigate(['/shop'], { queryParams: cat ? { cat: cat.id } : q ? { q } : {} });
  }
  @HostListener('document:click', ['$event']) close(e: Event) { if (!(e.target as HTMLElement).closest('.menu-wrap')) this.menu.set(false); }
}
