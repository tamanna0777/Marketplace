import { Component, Input, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StoreService } from '../store.service';
import { ArtComponent, InrPipe } from '../shared';

@Component({
  selector: 'app-summary', standalone: true, imports: [InrPipe],
  template: `
  <dl class="sum">
    <div><dt>Items</dt><dd>{{ store.subtotal() | inr }}</dd></div>
    <div><dt>Delivery ({{ store.cartGroups().length }} {{ store.cartGroups().length === 1 ? 'parcel' : 'parcels' }})</dt><dd>{{ store.shipping() ? (store.shipping() | inr) : 'Free' }}</dd></div>
    @if (store.discount()) { <div class="good"><dt>Coupon {{ store.coupon() }}</dt><dd>−{{ store.discount() | inr }}</dd></div> }
    <div class="total"><dt>Total</dt><dd>{{ store.total() | inr }}</dd></div>
  </dl>`,
})
export class SummaryComponent { store = inject(StoreService); }

@Component({
  selector: 'app-cart', standalone: true,
  imports: [RouterLink, FormsModule, ArtComponent, InrPipe, SummaryComponent],
  template: `
  <div class="container page">
    <h1 class="h-md">Your cart</h1>
    @if (store.cartGroups().length) {
      <div class="cart">
        <div>
          @for (g of store.cartGroups(); track g.vendor.id) {
            <section class="card cart-group">
              <header class="cart-group-head">
                <a [routerLink]="['/vendor', g.vendor.id]" class="row gap-sm"><span class="vendor-av sm" [style.background]="g.vendor.color">{{ g.vendor.emoji }}</span><strong>{{ g.vendor.name }}</strong></a>
                <span class="small" [class.good]="!g.shipping">{{ g.shipping ? 'Add ' + (store.freeShippingAt - g.subtotal | inr) + ' for free delivery' : 'Free delivery' }}</span>
              </header>
              @for (l of g.lines; track l.product.id) {
                <div class="line">
                  <a [routerLink]="['/product', l.product.id]"><app-art [emoji]="l.product.emoji" [color]="l.product.color" size="sm" /></a>
                  <div class="line-info">
                    <a [routerLink]="['/product', l.product.id]"><strong>{{ l.product.name }}</strong></a>
                    <span class="muted small">{{ l.product.price | inr }} each @if (l.product.stock <= 5) { · only {{ l.product.stock }} left }</span>
                    <div class="row gap-sm"><button class="link-btn" (click)="store.removeFromCart(l.product.id)">Remove</button><button class="link-btn" (click)="move(l.product.id)">Save for later</button></div>
                  </div>
                  <div class="stepper sm" role="group" aria-label="Quantity">
                    <button (click)="store.setQty(l.product.id, l.qty - 1)" aria-label="Decrease">−</button><span>{{ l.qty }}</span><button (click)="store.setQty(l.product.id, l.qty + 1)" [disabled]="l.qty >= l.product.stock" aria-label="Increase">+</button>
                  </div>
                  <strong class="line-total">{{ l.product.price * l.qty | inr }}</strong>
                </div>
              }
            </section>
          }
        </div>
        <aside class="card pad sticky">
          <h2 class="h-sm">Order summary</h2>
          <form class="coupon" (submit)="apply($event)">
            <input [(ngModel)]="code" name="code" placeholder="Coupon code" aria-label="Coupon code"><button class="btn btn-ghost">Apply</button>
          </form>
          <p class="muted small">Try WELCOME10 or HAAT200 (cart of ₹1,500+).</p>
          <app-summary />
          <a class="btn btn-lg block" routerLink="/checkout">Checkout</a>
          <button class="link-btn center-btn" (click)="store.clearCart()">Empty cart</button>
        </aside>
      </div>
    } @else {
      <div class="empty"><div class="empty-art">🛒</div><h2>Your cart is empty</h2><p class="muted">Add something from any seller and it will show up here.</p><a class="btn" routerLink="/shop">Start shopping</a></div>
    }
  </div>`,
})
export class CartPage {
  store = inject(StoreService);
  code = '';
  apply(e: Event) { e.preventDefault(); if (this.code.trim()) this.store.applyCoupon(this.code); }
  move(id: number) { if (!this.store.isWished(id)) this.store.toggleWish(id); this.store.removeFromCart(id); }
}

@Component({
  selector: 'app-checkout', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InrPipe, SummaryComponent],
  template: `
  <div class="container page">
    <h1 class="h-md">Checkout</h1>
    @if (store.cartCount()) {
      <div class="cart">
        <form class="card pad form" [formGroup]="f" (ngSubmit)="submit()" novalidate>
          <h2 class="h-sm">Delivery address</h2>
          <div class="form-grid">
            <label>Full name<input formControlName="name" autocomplete="name">@if (bad('name')) { <small class="err">Enter your full name</small> }</label>
            <label>Mobile number<input formControlName="phone" inputmode="numeric" autocomplete="tel" placeholder="10 digits">@if (bad('phone')) { <small class="err">Enter a 10-digit mobile number</small> }</label>
            <label class="span2">Address<input formControlName="line" autocomplete="street-address" placeholder="House no, street, area">@if (bad('line')) { <small class="err">Enter your address</small> }</label>
            <label>City<input formControlName="city" autocomplete="address-level2">@if (bad('city')) { <small class="err">Enter your city</small> }</label>
            <label>PIN code<input formControlName="pin" inputmode="numeric" autocomplete="postal-code">@if (bad('pin')) { <small class="err">Enter a 6-digit PIN code</small> }</label>
          </div>

          <h2 class="h-sm">Payment</h2>
          <div class="pay">
            @for (m of methods; track m.id) {
              <label class="pay-opt" [class.on]="f.value.payment === m.id"><input type="radio" formControlName="payment" [value]="m.id"><span><strong>{{ m.id }}</strong><small class="muted">{{ m.hint }}</small></span></label>
            }
          </div>
          @if (f.value.payment === 'UPI') { <label>UPI ID<input formControlName="upi" placeholder="name@bank">@if (bad('upi')) { <small class="err">Enter a valid UPI ID like name&#64;bank</small> }</label> }
          @if (f.value.payment === 'Card') { <label>Card number<input formControlName="card" inputmode="numeric" placeholder="16 digits">@if (bad('card')) { <small class="err">Enter a 16-digit card number</small> }</label> }
          <p class="muted small">This is a demo. No real payment is taken.</p>
          <button class="btn btn-lg" [disabled]="busy()">{{ busy() ? 'Placing order…' : 'Place order · ' + (store.total() | inr) }}</button>
        </form>
        <aside class="card pad sticky">
          <h2 class="h-sm">In your order</h2>
          @for (g of store.cartGroups(); track g.vendor.id) {
            <div class="mini-group"><strong>{{ g.vendor.name }}</strong>
              @for (l of g.lines; track l.product.id) { <div class="mini"><span>{{ l.product.emoji }} {{ l.product.name }} × {{ l.qty }}</span><span>{{ l.product.price * l.qty | inr }}</span></div> }
            </div>
          }
          <app-summary /><a routerLink="/cart" class="link">Edit cart</a>
        </aside>
      </div>
    } @else { <div class="empty"><div class="empty-art">🛒</div><h2>Nothing to check out</h2><a class="btn" routerLink="/shop">Browse products</a></div> }
  </div>`,
})
export class CheckoutPage {
  store = inject(StoreService);
  router = inject(Router);
  fb = inject(FormBuilder);
  busy = signal(false);
  methods = [{ id: 'UPI', hint: 'GPay, PhonePe, Paytm' }, { id: 'Card', hint: 'Credit or debit' }, { id: 'Cash on delivery', hint: 'Pay when it arrives' }];
  f = this.fb.nonNullable.group({
    name: [this.store.user()?.name ?? '', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    line: ['', Validators.required], city: ['', Validators.required], pin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    payment: ['UPI'], upi: [''], card: [''],
  });
  bad(c: string) { const x = this.f.get(c)!; return x.invalid && (x.touched || x.dirty); }
  submit() {
    const v = this.f.getRawValue();
    this.f.get('upi')!.setValidators(v.payment === 'UPI' ? [Validators.required, Validators.pattern(/^[\w.\-]+@[\w]+$/)] : []);
    this.f.get('card')!.setValidators(v.payment === 'Card' ? [Validators.required, Validators.pattern(/^\d{16}$/)] : []);
    this.f.get('upi')!.updateValueAndValidity(); this.f.get('card')!.updateValueAndValidity();
    if (this.f.invalid) { this.f.markAllAsTouched(); this.store.toast('Fix the highlighted fields', 'err'); return; }
    this.busy.set(true);
    setTimeout(() => {
      const o = this.store.placeOrder(`${v.name}, ${v.line}, ${v.city} ${v.pin} · ${v.phone}`, v.payment);
      this.router.navigate(['/order', o.id]);
    }, 900);
  }
}

@Component({
  selector: 'app-order-done', standalone: true, imports: [RouterLink, InrPipe, DatePipe],
  template: `
  <div class="container page narrow">
    @if (order(); as o) {
      <div class="done"><div class="done-mark">✓</div><h1>Order placed</h1><p class="muted">Order {{ o.id }} · {{ o.date | date:'d MMM y, h:mm a' }}</p></div>
      <div class="card pad">
        <p class="muted small">Delivering to {{ o.address }}</p>
        @for (g of groups(); track g.id) {
          <div class="mini-group"><strong>Parcel from {{ g.name }}</strong>
            @for (i of g.items; track i.productId) { <div class="mini"><span>{{ i.emoji }} {{ i.name }} × {{ i.qty }}</span><span>{{ i.price * i.qty | inr }}</span></div> }
          </div>
        }
        <div class="mini total"><span>Paid with {{ o.payment }}</span><strong>{{ o.total | inr }}</strong></div>
      </div>
      <div class="row gap-sm center"><a class="btn" routerLink="/account">Track orders</a><a class="btn btn-ghost" routerLink="/shop">Keep shopping</a></div>
    } @else { <div class="empty"><h2>Order not found</h2><a class="btn" routerLink="/account">My orders</a></div> }
  </div>`,
})
export class OrderDonePage {
  store = inject(StoreService);
  id = signal('');
  @Input('id') set setId(v: string) { this.id.set(v); }
  order = computed(() => this.store.orders().find(o => o.id === this.id()));
  groups = computed(() => {
    const o = this.order(); if (!o) return [];
    return [...new Set(o.items.map(i => i.vendorId))].map(v => ({ id: v, name: this.store.vendor(v)?.name ?? v, items: o.items.filter(i => i.vendorId === v) }));
  });
}
