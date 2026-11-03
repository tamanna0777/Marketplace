import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../store.service';
import { ProductCardComponent, ArtComponent, InrPipe } from '../shared';

@Component({
  selector: 'app-home', standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent, ArtComponent, InrPipe],
  template: `
  <section class="hero">
    <div class="container hero-in">
      <div class="hero-copy">
        <p class="eyebrow">Good things, from good people</p>
        <h1>Find your next favourite thing.</h1>
        <p class="lead">A thoughtfully gathered marketplace of independent Indian makers, growers and small businesses. Every find has a person and a story behind it.</p>
        <form class="hero-search" (submit)="go($event)">
          <input [(ngModel)]="q" name="q" placeholder="Try “handmade”, “honey”…" aria-label="Search">
          <button class="btn btn-lg">Explore <span aria-hidden="true">↗</span></button>
        </form>
        <div class="hero-actions">
          <a routerLink="/vendors">Meet the people behind it <span aria-hidden="true">→</span></a>
          <span>{{ store.vendors().length }} independent stores · all in one bag</span>
        </div>
        <div class="chips hero-chips">
          <span class="muted small">Popular right now</span>
          @for (t of ['kurta','honey','earbuds','planter']; track t) { <a class="chip" routerLink="/shop" [queryParams]="{ q: t }">{{ t }}</a> }
        </div>
      </div>
      <div class="collage" aria-label="Featured products">
        @for (p of collage(); track p.id; let i = $index) {
          <a class="tile" [routerLink]="['/product', p.id]" [style.--r]="rot[i]" [style.--d]="i">
            <app-art [emoji]="p.emoji" [color]="p.color" size="lg" />
            <span class="tile-tag">{{ p.name }}<small>{{ store.vendor(p.vendorId)?.name }}</small><b>{{ p.price | inr }}</b></span>
          </a>
        }
      </div>
    </div>
  </section>

  <section class="container section">
    <div class="section-head"><div><p class="section-kicker">A good place to start</p><h2>Browse the market</h2></div><a routerLink="/shop" class="link">View all products <span aria-hidden="true">→</span></a></div>
    <div class="cat-grid">
      @for (c of store.categories(); track c.id) {
        <a class="cat-tile" [routerLink]="['/shop']" [queryParams]="{ cat: c.id }" [style.background]="c.color">
          <span class="cat-emoji">{{ c.emoji }}</span><span>{{ c.name }}</span>
          <small>{{ countIn(c.id) }} items</small>
        </a>
      }
    </div>
  </section>

  <section class="container section">
    <div class="section-head"><div><p class="section-kicker">Lovely finds, lovely prices</p><h2>Worth a closer look</h2></div><a routerLink="/shop" [queryParams]="{ sort: 'discount' }" class="link">Shop the offers <span aria-hidden="true">→</span></a></div>
    <div class="grid">@for (p of deals(); track p.id) { <app-product-card [p]="p" /> }</div>
  </section>

  <section class="band">
    <div class="container section">
      <div class="section-head"><div><p class="section-kicker">The people make the place</p><h2>Meet your new favourite stores</h2></div><a routerLink="/vendors" class="link">All sellers <span aria-hidden="true">→</span></a></div>
      <div class="vendor-row">
        @for (v of store.vendors(); track v.id) {
          <a class="vendor-chip card" [routerLink]="['/vendor', v.id]">
            <span class="vendor-av" [style.background]="v.color">{{ v.emoji }}</span>
            <span><strong>{{ v.name }}</strong><small class="muted">{{ v.city }} · {{ v.rating ? v.rating + ' ★' : 'New' }}</small></span>
          </a>
        }
      </div>
    </div>
  </section>

  <section class="container section">
    <div class="section-head"><div><p class="section-kicker">Loved by the community</p><h2>Customer favourites</h2></div><a routerLink="/shop" [queryParams]="{ sort: 'rating' }" class="link">See what’s loved <span aria-hidden="true">→</span></a></div>
    <div class="grid">@for (p of top(); track p.id) { <app-product-card [p]="p" /> }</div>
  </section>

  <section class="container section promo">
    <div class="promo-box">
      <div><p class="section-kicker">Are you a maker?</p><h2>Bring your little corner to MarketHub.</h2><p>Set up your store, list what you make and meet customers who love buying small.</p></div>
      <a routerLink="/register" [queryParams]="{ role: 'vendor' }" class="btn btn-lg">Open your store <span aria-hidden="true">↗</span></a>
    </div>
    <ul class="perks">
      <li><b>Thoughtfully independent</b><br>Shop from sellers with a story behind their products.</li>
      <li><b>One easy checkout</b><br>Buy from different sellers in a single, simple cart.</li>
      <li><b>Made for peace of mind</b><br>Choose UPI, card or cash on delivery.</li>
    </ul>
  </section>`,
})
export class HomePage {
  store = inject(StoreService);
  router = inject(Router);
  q = '';
  rot = ['-4deg', '3deg', '-2deg', '5deg', '-3deg', '2deg'];
  collage = computed(() => [...this.store.products()].filter(p => p.stock > 0).sort((a, b) => b.rating - a.rating).filter((_, i) => i % 5 === 0).slice(0, 6));
  deals = computed(() => [...this.store.products()].filter(p => p.stock > 0).sort((a, b) => (1 - b.price / b.mrp) - (1 - a.price / a.mrp)).slice(0, 8));
  top = computed(() => [...this.store.products()].filter(p => p.reviewCount > 0).sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 4));
  countIn = (id: string) => this.store.products().filter(p => p.category === id).length;
  go(e: Event) { e.preventDefault(); this.router.navigate(['/shop'], { queryParams: this.q.trim() ? { q: this.q.trim() } : {} }); }
}

@Component({
  selector: 'app-404', standalone: true, imports: [RouterLink],
  template: `<section class="container empty"><div class="empty-art">🧭</div><h1>We couldn’t find that page</h1><p class="muted">The link may be old, or the product was removed by its seller.</p><a class="btn" routerLink="/shop">Browse all products</a></section>`,
})
export class NotFoundPage {}
