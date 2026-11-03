import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../store.service';
import { ProductCardComponent } from '../shared';

type Sort = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'discount' | 'newest';

@Component({
  selector: 'app-shop', standalone: true,
  imports: [FormsModule, RouterLink, ProductCardComponent],
  template: `
  <div class="container page">
    <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a> / <span>Shop</span>@if (catName()) { / <span>{{ catName() }}</span> }</nav>
    <div class="shop">
      <aside class="filters" [class.open]="drawer()">
        <div class="filters-head"><h2>Filters</h2><button class="link-btn" (click)="clear()">Clear all</button><button class="icon-btn only-sm" (click)="drawer.set(false)" aria-label="Close filters">✕</button></div>

        <fieldset><legend>Category</legend>
          <label class="opt"><input type="radio" name="cat" [checked]="!cat()" (change)="cat.set('')"> All categories</label>
          @for (c of store.categories(); track c.id) {
            <label class="opt"><input type="radio" name="cat" [checked]="cat() === c.id" (change)="cat.set(c.id)"> {{ c.emoji }} {{ c.name }}</label>
          }
        </fieldset>

        <fieldset><legend>Seller</legend>
          @for (v of store.vendors(); track v.id) {
            <label class="opt"><input type="checkbox" [checked]="vendors().includes(v.id)" (change)="toggleVendor(v.id)"> {{ v.name }}</label>
          }
        </fieldset>

        <fieldset><legend>Max price: ₹{{ maxPrice().toLocaleString('en-IN') }}</legend>
          <input type="range" min="200" [max]="priceCeil()" step="100" [ngModel]="maxPrice()" (ngModelChange)="maxPrice.set(+$event)" aria-label="Maximum price">
        </fieldset>

        <fieldset><legend>Customer rating</legend>
          @for (r of [4.5, 4, 0]; track r) {
            <label class="opt"><input type="radio" name="rate" [checked]="minRating() === r" (change)="minRating.set(r)"> {{ r ? r + ' ★ and up' : 'Any rating' }}</label>
          }
        </fieldset>
        <label class="opt switch"><input type="checkbox" [checked]="inStock()" (change)="inStock.set(!inStock())"> In stock only</label>
        <button class="btn only-sm" (click)="drawer.set(false)">Show {{ results().length }} results</button>
      </aside>

      <section>
        <div class="toolbar">
          <div><h1 class="h-md">{{ title() }}</h1><span class="muted">{{ results().length }} products</span></div>
          <div class="row gap-sm">
            <button class="btn btn-ghost only-sm" (click)="drawer.set(true)">Filters @if (activeCount()) { ({{ activeCount() }}) }</button>
            <label class="sort">Sort by
              <select [ngModel]="sort()" (ngModelChange)="sort.set($event)">
                <option value="relevance">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option><option value="discount">Biggest discount</option><option value="newest">Newest</option>
              </select>
            </label>
          </div>
        </div>

        @if (activeCount()) {
          <div class="chips">
            @if (q()) { <button class="chip x" (click)="q.set('')">“{{ q() }}” ✕</button> }
            @if (cat()) { <button class="chip x" (click)="cat.set('')">{{ catName() }} ✕</button> }
            @for (v of vendors(); track v) { <button class="chip x" (click)="toggleVendor(v)">{{ store.vendor(v)?.name }} ✕</button> }
            @if (minRating()) { <button class="chip x" (click)="minRating.set(0)">{{ minRating() }}★+ ✕</button> }
            @if (inStock()) { <button class="chip x" (click)="inStock.set(false)">In stock ✕</button> }
          </div>
        }

        @if (results().length) {
          <div class="grid grid-3">@for (p of shown(); track p.id) { <app-product-card [p]="p" /> }</div>
          @if (shown().length < results().length) {
            <div class="center"><button class="btn btn-ghost" (click)="limit.set(limit() + 12)">Show more ({{ results().length - shown().length }} left)</button></div>
          }
        } @else {
          <div class="empty"><div class="empty-art">🔍</div><h2>Nothing matches these filters</h2><p class="muted">Try a wider price range or remove a filter.</p><button class="btn" (click)="clear()">Clear filters</button></div>
        }
      </section>
    </div>
  </div>`,
})
export class ShopPage {
  store = inject(StoreService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  q = signal(''); cat = signal(''); vendors = signal<string[]>([]);
  priceCeil = computed(() => Math.ceil(Math.max(...this.store.products().map(p => p.price), 1000) / 100) * 100);
  maxPrice = signal(100000); minRating = signal(0); inStock = signal(false);
  sort = signal<Sort>('relevance'); limit = signal(12); drawer = signal(false);

  constructor() {
    this.route.queryParamMap.subscribe(m => {
      this.q.set(m.get('q') ?? ''); this.cat.set(m.get('cat') ?? '');
      this.vendors.set(m.get('vendor') ? m.get('vendor')!.split(',') : []);
      this.sort.set((m.get('sort') as Sort) ?? 'relevance');
    });
    this.maxPrice.set(this.priceCeil());
    // keep the URL shareable
    effect(() => {
      const queryParams = { q: this.q() || null, cat: this.cat() || null, vendor: this.vendors().join(',') || null, sort: this.sort() === 'relevance' ? null : this.sort() };
      this.router.navigate([], { queryParams, replaceUrl: true });
    });
    effect(() => { this.q(); this.cat(); this.vendors(); this.maxPrice(); this.minRating(); this.inStock(); this.sort(); this.limit.set(12); }, { allowSignalWrites: true });
  }

  catName = computed(() => this.store.category(this.cat())?.name ?? '');
  title = computed(() => this.q() ? `Results for “${this.q()}”` : this.catName() || 'All products');
  activeCount = computed(() => (this.q() ? 1 : 0) + (this.cat() ? 1 : 0) + this.vendors().length + (this.minRating() ? 1 : 0) + (this.inStock() ? 1 : 0) + (this.maxPrice() < this.priceCeil() ? 1 : 0));

  results = computed(() => {
    const q = this.q().trim().toLowerCase();
    let list = this.store.products().filter(p => {
      if (this.cat() && p.category !== this.cat()) return false;
      if (this.vendors().length && !this.vendors().includes(p.vendorId)) return false;
      if (p.price > this.maxPrice()) return false;
      if (this.minRating() && p.rating < this.minRating()) return false;
      if (this.inStock() && p.stock === 0) return false;
      if (q) {
        const hay = `${p.name} ${p.description} ${this.store.vendor(p.vendorId)?.name} ${this.store.category(p.category)?.name}`.toLowerCase();
        if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
      }
      return true;
    });
    const s = this.sort();
    const disc = (p: { price: number; mrp: number }) => 1 - p.price / p.mrp;
    list = [...list].sort((a, b) =>
      s === 'price-asc' ? a.price - b.price : s === 'price-desc' ? b.price - a.price : s === 'rating' ? b.rating - a.rating :
      s === 'discount' ? disc(b) - disc(a) : s === 'newest' ? b.createdAt.localeCompare(a.createdAt) : b.reviewCount - a.reviewCount);
    return list;
  });
  shown = computed(() => this.results().slice(0, this.limit()));

  toggleVendor(id: string) { this.vendors.update(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]); }
  clear() { this.q.set(''); this.cat.set(''); this.vendors.set([]); this.minRating.set(0); this.inStock.set(false); this.maxPrice.set(this.priceCeil()); this.sort.set('relevance'); }
}
