import { Component, Input, Pipe, PipeTransform, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from './models';
import { StoreService } from './store.service';

@Pipe({ name: 'inr', standalone: true })
export class InrPipe implements PipeTransform {
  transform(v: number | null | undefined): string { return '₹' + Math.round(v ?? 0).toLocaleString('en-IN'); }
}

@Component({
  selector: 'app-stars', standalone: true,
  template: `<span class="stars" [attr.aria-label]="value + ' out of 5'"><span class="stars-fill" [style.width.%]="value / 5 * 100">★★★★★</span>★★★★★</span>`,
})
export class StarsComponent { @Input() value = 0; }

@Component({
  selector: 'app-art', standalone: true,
  template: `<div class="art" [style.background]="color" [class.art-lg]="size === 'lg'" [class.art-sm]="size === 'sm'" aria-hidden="true"><span>{{ emoji }}</span></div>`,
})
export class ArtComponent { @Input() emoji = ''; @Input() color = '#eee'; @Input() size: 'sm' | 'md' | 'lg' = 'md'; }

@Component({
  selector: 'app-product-card', standalone: true,
  imports: [RouterLink, InrPipe, StarsComponent, ArtComponent],
  template: `
  <article class="card pcard">
    <a [routerLink]="['/product', p.id]" class="pcard-media">
      <app-art [emoji]="p.emoji" [color]="p.color" />
      @if (p.stock === 0) { <span class="badge badge-out">Sold out</span> }
      @else if (off > 0) { <span class="badge badge-sale">{{ off }}% off</span> }
      @else if (p.stock <= 5) { <span class="badge badge-low">Only {{ p.stock }} left</span> }
    </a>
    <button class="icon-btn wish" [class.on]="store.isWished(p.id)" (click)="store.toggleWish(p.id)"
      [attr.aria-label]="store.isWished(p.id) ? 'Remove from wishlist' : 'Save to wishlist'" [attr.aria-pressed]="store.isWished(p.id)">
      {{ store.isWished(p.id) ? '♥' : '♡' }}
    </button>
    <div class="pcard-body">
      <a class="pcard-vendor" [routerLink]="['/vendor', p.vendorId]">{{ vendorName }}</a>
      <a [routerLink]="['/product', p.id]" class="pcard-name">{{ p.name }}</a>
      <div class="row gap-sm muted small">
        @if (p.reviewCount) { <app-stars [value]="p.rating" /> <span>{{ p.rating }} ({{ p.reviewCount }})</span> } @else { <span>New</span> }
      </div>
      <div class="pcard-foot">
        <div class="price"><strong>{{ p.price | inr }}</strong> @if (off > 0) { <s class="muted small">{{ p.mrp | inr }}</s> }</div>
        <button class="btn btn-sm" [disabled]="p.stock === 0" (click)="store.addToCart(p)">{{ p.stock === 0 ? 'Sold out' : 'Add' }}</button>
      </div>
    </div>
  </article>`,
})
export class ProductCardComponent {
  store = inject(StoreService);
  @Input({ required: true }) p!: Product;
  get off() { return this.p.mrp > this.p.price ? Math.round((1 - this.p.price / this.p.mrp) * 100) : 0; }
  get vendorName() { return this.store.vendor(this.p.vendorId)?.name ?? ''; }
}
