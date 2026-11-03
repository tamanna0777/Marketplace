import { Component, Input, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../store.service';
import { ProductCardComponent, StarsComponent } from '../shared';

@Component({
  selector: 'app-vendors', standalone: true, imports: [RouterLink, StarsComponent],
  template: `
  <div class="container page">
    <h1 class="h-md">Sellers on MarketHub</h1>
    <p class="muted">Every seller ships their own parcels, so a mixed cart can arrive in separate boxes.</p>
    <div class="grid grid-3">
      @for (v of store.vendors(); track v.id) {
        <a class="card vcard" [routerLink]="['/vendor', v.id]">
          <div class="vcard-top" [style.background]="v.color"><span>{{ v.emoji }}</span></div>
          <div class="pad">
            <h3>{{ v.name }}</h3><p class="muted">{{ v.tagline }}</p>
            <div class="row gap-sm small"><app-stars [value]="v.rating" /> <span>{{ v.rating || 'New' }}</span><span class="muted">· {{ v.city }} · {{ store.productsOf(v.id).length }} products</span></div>
          </div>
        </a>
      }
    </div>
  </div>`,
})
export class VendorsPage { store = inject(StoreService); }

@Component({
  selector: 'app-vendor', standalone: true, imports: [RouterLink, ProductCardComponent, StarsComponent],
  template: `
  @if (v(); as v) {
  <section class="vbanner" [style.background]="v.color">
    <div class="container vbanner-in">
      <span class="vbanner-av">{{ v.emoji }}</span>
      <div><h1>{{ v.name }}</h1><p>{{ v.tagline }}</p>
        <div class="row gap-sm"><app-stars [value]="v.rating" /><span>{{ v.rating || 'New seller' }}</span><span>· {{ v.city }} · selling since {{ v.since }}</span></div></div>
    </div>
  </section>
  <div class="container page">
    <p class="about">{{ v.about }}</p>
    <div class="chips">
      <button class="chip" [class.on]="!cat()" (click)="cat.set('')">All ({{ all().length }})</button>
      @for (c of cats(); track c.id) { <button class="chip" [class.on]="cat() === c.id" (click)="cat.set(c.id)">{{ c.name }}</button> }
    </div>
    @if (list().length) { <div class="grid grid-3">@for (p of list(); track p.id) { <app-product-card [p]="p" /> }</div> }
    @else { <div class="empty"><div class="empty-art">🛍️</div><h2>No products yet</h2><p class="muted">This seller hasn’t listed anything. Check back soon.</p></div> }
  </div>
  } @else { <section class="container empty"><h1>Seller not found</h1><a class="btn" routerLink="/vendors">All sellers</a></section> }`,
})
export class VendorPage {
  store = inject(StoreService);
  id = signal('');
  @Input('id') set setId(v: string) { this.id.set(v); this.cat.set(''); }
  cat = signal('');
  v = computed(() => this.store.vendor(this.id()));
  all = computed(() => this.store.productsOf(this.id()));
  cats = computed(() => this.store.categories().filter(c => this.all().some(p => p.category === c.id)));
  list = computed(() => this.all().filter(p => !this.cat() || p.category === this.cat()));
}
