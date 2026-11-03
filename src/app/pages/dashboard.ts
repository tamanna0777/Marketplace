import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StoreService } from '../store.service';
import { Order, OrderStatus, Product, STATUSES } from '../models';
import { ArtComponent, InrPipe } from '../shared';

@Component({
  selector: 'app-dashboard', standalone: true, imports: [RouterLink, DatePipe, ReactiveFormsModule, InrPipe, ArtComponent],
  template: `
  <div class="container page">
    <div class="row between wrap">
      <div><h1 class="h-md">{{ vendor()?.name }}</h1><span class="muted">Seller dashboard</span></div>
      <div class="row gap-sm"><a class="btn btn-ghost" [routerLink]="['/vendor', vendor()?.id]">View my store</a><button class="btn" (click)="openForm()">Add product</button></div>
    </div>
    <div class="tabs left" role="tablist">
      @for (t of tabs; track t.id) { <button role="tab" [class.on]="tab() === t.id" (click)="tab.set(t.id)">{{ t.label }}</button> }
    </div>

    @if (tab() === 'overview') {
      <div class="stats">
        <div class="card pad stat"><span class="muted">Revenue (14 days)</span><strong>{{ revenue() | inr }}</strong></div>
        <div class="card pad stat"><span class="muted">Orders</span><strong>{{ orders().length }}</strong><small class="muted">{{ pending() }} need action</small></div>
        <div class="card pad stat"><span class="muted">Products live</span><strong>{{ products().length }}</strong></div>
        <div class="card pad stat" [class.warn]="low().length"><span class="muted">Low or no stock</span><strong>{{ low().length }}</strong></div>
      </div>
      <div class="two">
        <section class="card pad">
          <h2 class="h-sm">Daily revenue, last 7 days</h2>
          <div class="bars" role="img" [attr.aria-label]="'Revenue per day, highest ' + (max() | inr)">
            @for (d of days(); track d.label) {
              <div class="bar"><span class="bar-val small">{{ d.value ? (d.value | inr) : '' }}</span><div class="bar-fill" [style.height.%]="d.value / max() * 100"></div><span class="small muted">{{ d.label }}</span></div>
            }
          </div>
        </section>
        <section class="card pad">
          <h2 class="h-sm">Needs your attention</h2>
          @for (p of low(); track p.id) { <div class="mini"><span>{{ p.emoji }} {{ p.name }}</span><button class="link-btn" (click)="openForm(p)">{{ p.stock === 0 ? 'Out of stock · restock' : p.stock + ' left · restock' }}</button></div> }
          @for (o of pendingOrders(); track o.id) { <div class="mini"><span>Order {{ o.id }} is {{ o.status.toLowerCase() }}</span><button class="link-btn" (click)="tab.set('orders')">Update</button></div> }
          @if (!low().length && !pendingOrders().length) { <p class="muted">All caught up. Nothing needs action right now.</p> }
        </section>
      </div>
    }

    @if (tab() === 'products') {
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr></thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr>
                <td><div class="row gap-sm"><app-art [emoji]="p.emoji" [color]="p.color" size="sm" /><div><a [routerLink]="['/product', p.id]"><strong>{{ p.name }}</strong></a><div class="muted small">{{ store.category(p.category)?.name }}</div></div></div></td>
                <td>{{ p.price | inr }}</td>
                <td><span class="pill" [class.warn]="p.stock <= 5">{{ p.stock }}</span></td>
                <td>{{ p.reviewCount ? p.rating : '–' }}</td>
                <td class="actions"><button class="link-btn" (click)="openForm(p)">Edit</button><button class="link-btn danger" (click)="remove(p)">Delete</button></td>
              </tr>
            } @empty { <tr><td colspan="5"><div class="empty sm"><h3>No products yet</h3><button class="btn" (click)="openForm()">Add your first product</button></div></td></tr> }
          </tbody>
        </table>
      </div>
    }

    @if (tab() === 'orders') {
      @for (o of orders(); track o.id) {
        <article class="card pad order">
          <header class="row between wrap"><div><strong>{{ o.id }}</strong> <span class="muted small">{{ o.customer }} · {{ o.date | date:'d MMM, h:mm a' }}</span></div>
            <label class="row gap-sm small">Status
              <select [value]="o.status" (change)="setStatus(o, $any($event.target).value)">@for (s of statuses; track s) { <option [value]="s" [selected]="s === o.status">{{ s }}</option> }</select>
            </label></header>
          @for (i of mine(o); track i.productId) { <div class="mini"><span>{{ i.emoji }} {{ i.name }} × {{ i.qty }}</span><span>{{ i.price * i.qty | inr }}</span></div> }
          <div class="mini total"><span>Your share</span><strong>{{ share(o) | inr }}</strong></div>
        </article>
      } @empty { <div class="empty"><div class="empty-art">📬</div><h2>No orders yet</h2><p class="muted">When a customer buys from you, the order lands here.</p></div> }
    }
  </div>

  @if (showForm()) {
    <div class="modal-back" (click)="showForm.set(false)">
      <form class="modal card pad form" [formGroup]="pf" (ngSubmit)="save()" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Product form" novalidate>
        <div class="row between"><h2 class="h-sm">{{ editing() ? 'Edit product' : 'Add product' }}</h2><button type="button" class="icon-btn" (click)="showForm.set(false)" aria-label="Close">✕</button></div>
        <div class="preview"><app-art [emoji]="pf.value.emoji || '📦'" [color]="pf.value.color || '#eee'" size="sm" /><span class="muted small">Live preview</span></div>
        <label>Product name<input formControlName="name">@if (bad('name')) { <small class="err">Enter a product name</small> }</label>
        <div class="form-grid">
          <label>Category<select formControlName="category">@for (c of store.categories(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }</select></label>
          <label>Stock<input type="number" min="0" formControlName="stock">@if (bad('stock')) { <small class="err">Enter 0 or more</small> }</label>
          <label>Selling price (₹)<input type="number" min="1" formControlName="price">@if (bad('price')) { <small class="err">Enter a price above 0</small> }</label>
          <label>MRP (₹)<input type="number" min="0" formControlName="mrp"></label>
          <label>Emoji icon<input formControlName="emoji" maxlength="4"></label>
          <label>Tile colour<input type="color" formControlName="color"></label>
        </div>
        <label>Description<textarea rows="3" formControlName="description"></textarea></label>
        <div class="row gap-sm end"><button type="button" class="btn btn-ghost" (click)="showForm.set(false)">Cancel</button><button class="btn">{{ editing() ? 'Save changes' : 'Publish product' }}</button></div>
      </form>
    </div>
  }`,
})
export class DashboardPage {
  store = inject(StoreService); fb = inject(FormBuilder);
  statuses = STATUSES;
  tabs = [{ id: 'overview', label: 'Overview' }, { id: 'products', label: 'Products' }, { id: 'orders', label: 'Orders' }] as const;
  tab = signal<'overview' | 'products' | 'orders'>('overview');
  showForm = signal(false); editing = signal<Product | null>(null);

  vid = computed(() => this.store.user()?.vendorId ?? '');
  vendor = computed(() => this.store.vendor(this.vid()));
  products = computed(() => this.store.productsOf(this.vid()));
  orders = computed(() => this.store.vendorOrders(this.vid()));
  low = computed(() => this.products().filter(p => p.stock <= 5));
  pendingOrders = computed(() => this.orders().filter(o => o.status === 'Placed' || o.status === 'Packed').slice(0, 4));
  pending = computed(() => this.orders().filter(o => o.status === 'Placed').length);
  mine = (o: Order) => o.items.filter(i => i.vendorId === this.vid());
  share = (o: Order) => this.mine(o).reduce((a, i) => a + i.price * i.qty, 0);
  revenue = computed(() => this.orders().reduce((a, o) => a + this.share(o), 0));
  days = computed(() => {
    const out: { label: string; value: number }[] = [];
    for (let k = 6; k >= 0; k--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - k);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const value = this.orders().filter(o => { const t = new Date(o.date); return t >= d && t < next; }).reduce((a, o) => a + this.share(o), 0);
      out.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), value });
    }
    return out;
  });
  max = computed(() => Math.max(1, ...this.days().map(d => d.value)));

  pf = this.fb.nonNullable.group({
    name: ['', Validators.required], category: ['home-decor'], price: [0, [Validators.required, Validators.min(1)]], mrp: [0],
    stock: [10, [Validators.required, Validators.min(0)]], emoji: ['📦'], color: ['#f4b860'], description: [''],
  });
  bad(c: string) { const x = this.pf.get(c)!; return x.invalid && (x.touched || x.dirty); }

  openForm(p?: Product) {
    this.editing.set(p ?? null);
    if (p) this.pf.reset({ name: p.name, category: p.category, price: p.price, mrp: p.mrp, stock: p.stock, emoji: p.emoji, color: p.color, description: p.description });
    else this.pf.reset({ name: '', category: this.store.categories()[0].id, price: 0, mrp: 0, stock: 10, emoji: '📦', color: '#f4b860', description: '' });
    this.showForm.set(true);
  }
  save() {
    if (this.pf.invalid) { this.pf.markAllAsTouched(); return; }
    this.store.saveProduct({ ...this.pf.getRawValue(), id: this.editing()?.id, vendorId: this.vid() });
    this.showForm.set(false);
  }
  remove(p: Product) { if (confirm(`Delete “${p.name}”? This can’t be undone.`)) this.store.deleteProduct(p.id); }
  setStatus(o: Order, s: OrderStatus) { this.store.setOrderStatus(o.id, s); }
}
