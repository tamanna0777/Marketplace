import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { StoreService } from '../store.service';
import { STATUSES } from '../models';
import { InrPipe, ProductCardComponent } from '../shared';

@Component({
  selector: 'app-account', standalone: true, imports: [RouterLink, DatePipe, InrPipe, ProductCardComponent],
  template: `
  <div class="container page">
    <div class="row between"><div><h1 class="h-md">Hi, {{ store.user()?.name }}</h1><span class="muted">{{ store.user()?.email }}</span></div>
      <button class="btn btn-ghost" (click)="store.logout()">Sign out</button></div>
    <div class="tabs left" role="tablist">
      <button role="tab" [class.on]="tab() === 'orders'" (click)="tab.set('orders')">Orders ({{ store.myOrders().length }})</button>
      <button role="tab" id="wishlist" [class.on]="tab() === 'wishlist'" (click)="tab.set('wishlist')">Wishlist ({{ store.wishlist().length }})</button>
    </div>

    @if (tab() === 'orders') {
      @for (o of store.myOrders(); track o.id) {
        <article class="card pad order">
          <header class="row between"><div><strong>Order {{ o.id }}</strong><div class="muted small">{{ o.date | date:'d MMM y' }} · {{ o.payment }}</div></div><strong>{{ o.total | inr }}</strong></header>
          <ol class="track" [attr.aria-label]="'Status: ' + o.status">
            @for (s of statuses; track s; let i = $index) { <li [class.done]="i <= statuses.indexOf(o.status)">{{ s }}</li> }
          </ol>
          @for (i of o.items; track i.productId) {
            <div class="mini"><a [routerLink]="['/product', i.productId]">{{ i.emoji }} {{ i.name }} × {{ i.qty }}</a><span class="muted small">{{ store.vendor(i.vendorId)?.name }}</span></div>
          }
        </article>
      } @empty {
        <div class="empty"><div class="empty-art">📦</div><h2>No orders yet</h2><p class="muted">Orders you place will appear here with live status.</p><a class="btn" routerLink="/shop">Start shopping</a></div>
      }
    } @else {
      @if (wished().length) { <div class="grid">@for (p of wished(); track p.id) { <app-product-card [p]="p" /> }</div> }
      @else { <div class="empty"><div class="empty-art">♡</div><h2>Your wishlist is empty</h2><p class="muted">Tap the heart on any product to save it here.</p><a class="btn" routerLink="/shop">Browse products</a></div> }
    }
  </div>`,
})
export class AccountPage {
  store = inject(StoreService);
  statuses = STATUSES;
  tab = signal<'orders' | 'wishlist'>(inject(ActivatedRoute).snapshot.fragment === 'wishlist' ? 'wishlist' : 'orders');
  wished = () => this.store.wishlist().map(id => this.store.product(id)).filter(p => !!p) as any[];
}
