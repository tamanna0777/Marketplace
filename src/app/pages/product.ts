import { Component, Input, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { StoreService } from '../store.service';
import { ArtComponent, InrPipe, ProductCardComponent, StarsComponent } from '../shared';

@Component({
  selector: 'app-product', standalone: true,
  imports: [RouterLink, FormsModule, ArtComponent, InrPipe, StarsComponent, ProductCardComponent],
  template: `
  @if (p(); as p) {
  <div class="container page">
    <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a> / <a [routerLink]="['/shop']" [queryParams]="{ cat: p.category }">{{ store.category(p.category)?.name }}</a> / <span>{{ p.name }}</span></nav>
    <div class="pdp">
      <div class="pdp-media">
        <app-art [emoji]="p.emoji" [color]="p.color" size="lg" />
        <button class="icon-btn wish lg" [class.on]="store.isWished(p.id)" (click)="store.toggleWish(p.id)" [attr.aria-label]="'Toggle wishlist'">{{ store.isWished(p.id) ? '♥' : '♡' }}</button>
      </div>
      <div class="pdp-info">
        <a class="pcard-vendor" [routerLink]="['/vendor', p.vendorId]">Sold by {{ vendor()?.name }}</a>
        <h1>{{ p.name }}</h1>
        <div class="row gap-sm">
          @if (p.reviewCount) { <app-stars [value]="p.rating" /><a href="#reviews" class="link">{{ p.rating }} · {{ p.reviewCount }} ratings</a> } @else { <span class="muted">No ratings yet</span> }
        </div>
        <div class="pdp-price">
          <strong>{{ p.price | inr }}</strong>
          @if (off() > 0) { <s class="muted">{{ p.mrp | inr }}</s><span class="badge badge-sale">{{ off() }}% off</span> }
        </div>
        <p class="lead-sm">{{ p.description }}</p>

        <div class="stock" [class.low]="p.stock > 0 && p.stock <= 5" [class.out]="p.stock === 0">
          {{ p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? 'Only ' + p.stock + ' left, order soon' : 'In stock' }}
        </div>

        @if (p.stock > 0) {
          <div class="buy-row">
            <div class="stepper" role="group" aria-label="Quantity">
              <button (click)="qty.set(Math.max(1, qty() - 1))" aria-label="Decrease">−</button>
              <span>{{ qty() }}</span>
              <button (click)="qty.set(Math.min(p.stock, qty() + 1))" aria-label="Increase">+</button>
            </div>
            <button class="btn btn-lg" (click)="store.addToCart(p, qty())">Add to cart</button>
            <button class="btn btn-lg btn-accent" (click)="buyNow()">Buy now</button>
          </div>
        }
        <ul class="assure">
          <li>🚚 {{ p.price * qty() >= store.freeShippingAt ? 'Free delivery on this parcel' : 'Add ' + ((store.freeShippingAt - p.price * qty()) | inr) + ' more for free delivery from this seller' }}</li>
          <li>↩️ 7-day returns · 💳 UPI, card or COD</li>
        </ul>

        <a class="vendor-card card" [routerLink]="['/vendor', p.vendorId]">
          <span class="vendor-av" [style.background]="vendor()?.color">{{ vendor()?.emoji }}</span>
          <span><strong>{{ vendor()?.name }}</strong><small class="muted">{{ vendor()?.tagline }} · {{ vendor()?.city }}</small></span>
          <span class="link">Visit store</span>
        </a>
      </div>
    </div>

    <section id="reviews" class="reviews">
      <h2>Reviews</h2>
      <div class="reviews-grid">
        <div>
          @for (r of p.reviews; track $index) {
            <article class="review"><div class="row gap-sm"><app-stars [value]="r.rating" /><strong>{{ r.user }}</strong><span class="muted small">{{ r.date }}</span></div><p>{{ r.text }}</p></article>
          } @empty { <p class="muted">No reviews yet. Be the first to share how it worked out.</p> }
        </div>
        <form class="card pad review-form" (submit)="submitReview($event)">
          <h3>Write a review</h3>
          @if (store.user()) {
            <div class="rate-pick" role="radiogroup" aria-label="Your rating">
              @for (n of [1,2,3,4,5]; track n) { <button type="button" [class.on]="n <= rate()" (click)="rate.set(n)" [attr.aria-label]="n + ' stars'">★</button> }
            </div>
            <textarea [(ngModel)]="text" name="text" rows="3" placeholder="What did you like or dislike?" required></textarea>
            <button class="btn" [disabled]="!rate() || text.trim().length < 5">Post review</button>
          } @else { <p class="muted">Sign in to review this product.</p><a class="btn" routerLink="/login" [queryParams]="{ next: '/product/' + p.id }">Sign in</a> }
        </form>
      </div>
    </section>

    @if (more().length) {
      <section class="section"><div class="section-head"><h2>More from {{ vendor()?.name }}</h2></div><div class="grid">@for (x of more(); track x.id) { <app-product-card [p]="x" /> }</div></section>
    }
    @if (related().length) {
      <section class="section"><div class="section-head"><h2>You may also like</h2></div><div class="grid">@for (x of related(); track x.id) { <app-product-card [p]="x" /> }</div></section>
    }
  </div>
  } @else {
    <section class="container empty"><div class="empty-art">📦</div><h1>This product isn’t available</h1><p class="muted">The seller may have removed it.</p><a class="btn" routerLink="/shop">Browse products</a></section>
  }`,
})
export class ProductPage {
  store = inject(StoreService);
  router = inject(Router);
  title = inject(Title);
  Math = Math;
  private id = signal(0);
  @Input('id') set setId(v: string) { this.id.set(+v); this.qty.set(1); }
  qty = signal(1); rate = signal(0); text = '';

  p = computed(() => { const p = this.store.product(this.id()); if (p) this.title.setTitle(`${p.name} | MarketHub`); return p; });
  vendor = computed(() => { const p = this.p(); return p ? this.store.vendor(p.vendorId) : undefined; });
  off = computed(() => { const p = this.p(); return p && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0; });
  more = computed(() => { const p = this.p(); return p ? this.store.productsOf(p.vendorId).filter(x => x.id !== p.id).slice(0, 4) : []; });
  related = computed(() => { const p = this.p(); return p ? this.store.products().filter(x => x.category === p.category && x.vendorId !== p.vendorId).slice(0, 4) : []; });

  buyNow() { this.store.addToCart(this.p()!, this.qty()); this.router.navigate(['/checkout']); }
  submitReview(e: Event) {
    e.preventDefault();
    if (!this.rate() || this.text.trim().length < 5) return;
    this.store.addReview(this.id(), this.rate(), this.text.trim());
    this.rate.set(0); this.text = '';
  }
}
