import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CartGroup, CartLine, Category, Order, OrderStatus, Product, Toast, User, Vendor } from './models';

const K = { products: 'haat.products', vendors: 'haat.vendors', users: 'haat.users', orders: 'haat.orders', cart: 'haat.cart', wish: 'haat.wish', session: 'haat.session' };
const FREE_SHIPPING_AT = 499;
const SHIPPING_FEE = 49;

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private http = inject(HttpClient);

  readonly categories = signal<Category[]>([]);
  readonly vendors = signal<Vendor[]>([]);
  readonly products = signal<Product[]>([]);
  readonly users = signal<User[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly cart = signal<{ productId: number; qty: number }[]>(read(K.cart, []));
  readonly wishlist = signal<number[]>(read(K.wish, []));
  readonly session = signal<string | null>(read<string | null>(K.session, null));
  readonly coupon = signal<string | null>(null);
  readonly toasts = signal<Toast[]>([]);
  private toastId = 0;
  private ready = false;

  constructor() {
    effect(() => { const v = this.products(); if (this.ready) write(K.products, v); });
    effect(() => { const v = this.vendors(); if (this.ready) write(K.vendors, v); });
    effect(() => { const v = this.users(); if (this.ready) write(K.users, v); });
    effect(() => { const v = this.orders(); if (this.ready) write(K.orders, v); });
    effect(() => write(K.cart, this.cart()));
    effect(() => write(K.wish, this.wishlist()));
    effect(() => write(K.session, this.session()));
  }

  /** Loads the JSON "database" once. Anything the user changes afterwards lives in localStorage. */
  async init() {
    const get = <T>(f: string) => firstValueFrom(this.http.get<T>(`assets/data/${f}.json`));
    const [cats, vendors, products, users, seedOrders] = await Promise.all([
      get<Category[]>('categories'), get<Vendor[]>('vendors'), get<Product[]>('products'), get<User[]>('users'), get<any[]>('orders'),
    ]);
    this.categories.set(cats);
    this.vendors.set(read(K.vendors, vendors));
    this.products.set(read(K.products, products));
    this.users.set(read(K.users, users));
    const savedOrders = read<Order[] | null>(K.orders, null);
    if (savedOrders) this.orders.set(savedOrders);
    else this.orders.set(this.buildSeedOrders(seedOrders, products));
    this.ready = true;
    write(K.products, this.products()); write(K.vendors, this.vendors()); write(K.users, this.users()); write(K.orders, this.orders());
  }

  private buildSeedOrders(seed: any[], products: Product[]): Order[] {
    return seed.map(s => {
      const items = s.items.map((i: any) => {
        const p = products.find(x => x.id === i.productId)!;
        return { productId: p.id, name: p.name, vendorId: p.vendorId, price: p.price, qty: i.qty, emoji: p.emoji, color: p.color };
      });
      const subtotal = items.reduce((a: number, i: any) => a + i.price * i.qty, 0);
      const shipping = this.shippingFor(items);
      return {
        id: s.id, userId: 'seed', customer: s.customer, date: new Date(Date.now() - s.daysAgo * 864e5).toISOString(),
        items, subtotal, shipping, discount: 0, total: subtotal + shipping, status: s.status, address: s.city, payment: s.payment,
      } as Order;
    });
  }

  private shippingFor(items: { vendorId: string; price: number; qty: number }[]) {
    const byVendor = new Map<string, number>();
    items.forEach(i => byVendor.set(i.vendorId, (byVendor.get(i.vendorId) ?? 0) + i.price * i.qty));
    let fee = 0; byVendor.forEach(sub => { if (sub < FREE_SHIPPING_AT) fee += SHIPPING_FEE; });
    return fee;
  }

  // ---------- lookups ----------
  vendor = (id: string) => this.vendors().find(v => v.id === id);
  product = (id: number) => this.products().find(p => p.id === id);
  category = (id: string) => this.categories().find(c => c.id === id);
  productsOf = (vendorId: string) => this.products().filter(p => p.vendorId === vendorId);

  // ---------- auth ----------
  readonly user = computed(() => this.users().find(u => u.id === this.session()) ?? null);
  readonly isVendor = computed(() => this.user()?.role === 'vendor');

  login(email: string, password: string): User | null {
    const u = this.users().find(x => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
    if (u) { this.session.set(u.id); this.toast(`Welcome back, ${u.name.split(' ')[0]}`); }
    return u ?? null;
  }
  register(data: { name: string; email: string; password: string; role: 'customer' | 'vendor'; storeName?: string; city?: string }): { ok: boolean; error?: string } {
    if (this.users().some(u => u.email.toLowerCase() === data.email.trim().toLowerCase())) return { ok: false, error: 'An account with this email already exists. Try signing in.' };
    const id = 'u-' + Date.now();
    const user: User = { id, name: data.name.trim(), email: data.email.trim(), password: data.password, role: data.role };
    if (data.role === 'vendor') {
      const vid = (data.storeName ?? 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + id.slice(-4);
      const colors = ['#F4B860', '#9AD0EC', '#B8A9F0', '#F28F8F', '#8FD6A4', '#F7D774'];
      this.vendors.update(v => [...v, {
        id: vid, name: data.storeName!.trim(), tagline: 'New on MarketHub', city: (data.city || 'India').trim(), emoji: '🏪',
        color: colors[this.vendors().length % colors.length], rating: 0, since: new Date().getFullYear(), about: 'This seller just opened a stall. Say hello by browsing their first products.',
      }]);
      user.vendorId = vid;
    }
    this.users.update(u => [...u, user]);
    this.session.set(id);
    this.toast(data.role === 'vendor' ? 'Your store is ready. Add your first product.' : 'Account created');
    return { ok: true };
  }
  logout() { this.session.set(null); this.toast('Signed out', 'info'); }

  // ---------- wishlist ----------
  isWished = (id: number) => this.wishlist().includes(id);
  toggleWish(id: number) {
    const on = this.isWished(id);
    this.wishlist.update(w => on ? w.filter(x => x !== id) : [...w, id]);
    this.toast(on ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
  }

  // ---------- cart ----------
  readonly cartLines = computed<CartLine[]>(() =>
    this.cart().map(c => ({ product: this.product(c.productId)!, qty: c.qty })).filter(l => !!l.product));
  readonly cartCount = computed(() => this.cartLines().reduce((a, l) => a + l.qty, 0));
  readonly cartGroups = computed<CartGroup[]>(() => {
    const map = new Map<string, CartLine[]>();
    this.cartLines().forEach(l => map.set(l.product.vendorId, [...(map.get(l.product.vendorId) ?? []), l]));
    return [...map.entries()].map(([vid, lines]) => {
      const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
      return { vendor: this.vendor(vid)!, lines, subtotal, shipping: subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE };
    });
  });
  readonly subtotal = computed(() => this.cartGroups().reduce((a, g) => a + g.subtotal, 0));
  readonly shipping = computed(() => this.cartGroups().reduce((a, g) => a + g.shipping, 0));
  readonly discount = computed(() => {
    const c = this.coupon(), s = this.subtotal();
    if (c === 'WELCOME10') return Math.round(s * 0.1);
    if (c === 'HAAT200' && s >= 1500) return 200;
    return 0;
  });
  readonly total = computed(() => Math.max(0, this.subtotal() + this.shipping() - this.discount()));
  readonly freeShippingAt = FREE_SHIPPING_AT;

  addToCart(p: Product, qty = 1) {
    if (p.stock <= 0) { this.toast('This item is out of stock', 'err'); return; }
    const existing = this.cart().find(c => c.productId === p.id);
    const next = Math.min(p.stock, (existing?.qty ?? 0) + qty);
    if (existing && next === existing.qty) { this.toast(`Only ${p.stock} in stock`, 'err'); return; }
    this.cart.update(c => existing ? c.map(x => x.productId === p.id ? { ...x, qty: next } : x) : [...c, { productId: p.id, qty: next }]);
    this.toast(`Added “${p.name}” to cart`);
  }
  setQty(id: number, qty: number) {
    const p = this.product(id); if (!p) return;
    if (qty <= 0) return this.removeFromCart(id);
    this.cart.update(c => c.map(x => x.productId === id ? { ...x, qty: Math.min(qty, p.stock) } : x));
  }
  removeFromCart(id: number) { this.cart.update(c => c.filter(x => x.productId !== id)); }
  clearCart() { this.cart.set([]); this.coupon.set(null); }
  applyCoupon(code: string): boolean {
    const c = code.trim().toUpperCase();
    if (c === 'WELCOME10' || (c === 'HAAT200' && this.subtotal() >= 1500)) { this.coupon.set(c); this.toast(`Coupon ${c} applied`); return true; }
    this.toast(c === 'HAAT200' ? 'HAAT200 needs a cart of ₹1,500 or more' : 'That code isn’t valid', 'err');
    return false;
  }

  // ---------- orders ----------
  placeOrder(address: string, payment: string): Order {
    const u = this.user()!;
    const items = this.cartLines().map(l => ({ productId: l.product.id, name: l.product.name, vendorId: l.product.vendorId, price: l.product.price, qty: l.qty, emoji: l.product.emoji, color: l.product.color }));
    const order: Order = {
      id: 'HT-' + Math.floor(5000 + Math.random() * 90000), userId: u.id, customer: u.name, date: new Date().toISOString(), items,
      subtotal: this.subtotal(), shipping: this.shipping(), discount: this.discount(), total: this.total(), status: 'Placed', address, payment,
    };
    this.products.update(ps => ps.map(p => { const i = items.find(x => x.productId === p.id); return i ? { ...p, stock: Math.max(0, p.stock - i.qty) } : p; }));
    this.orders.update(o => [order, ...o]);
    this.clearCart();
    return order;
  }
  myOrders = computed(() => this.orders().filter(o => o.userId === this.session()));
  vendorOrders = (vendorId: string) => this.orders().filter(o => o.items.some(i => i.vendorId === vendorId));
  setOrderStatus(id: string, status: OrderStatus) {
    this.orders.update(o => o.map(x => x.id === id ? { ...x, status } : x));
    this.toast(`Order ${id} marked ${status.toLowerCase()}`);
  }

  // ---------- vendor product management ----------
  saveProduct(data: Partial<Product> & { vendorId: string }) {
    if (data.id) {
      this.products.update(ps => ps.map(p => p.id === data.id ? { ...p, ...data } as Product : p));
      this.toast('Product updated');
    } else {
      const id = Math.max(0, ...this.products().map(p => p.id)) + 1;
      const cat = this.category(data.category!);
      const p: Product = {
        id, vendorId: data.vendorId, category: data.category!, name: data.name!, price: data.price!, mrp: data.mrp || data.price!, stock: data.stock ?? 0,
        rating: 0, reviewCount: 0, emoji: data.emoji || cat?.emoji || '📦', color: data.color || cat?.color || '#ddd', description: data.description || '',
        tags: [data.category!, data.vendorId], reviews: [], createdAt: new Date().toISOString().slice(0, 10),
      };
      this.products.update(ps => [p, ...ps]);
      this.toast('Product published');
    }
  }
  deleteProduct(id: number) {
    this.products.update(ps => ps.filter(p => p.id !== id));
    this.cart.update(c => c.filter(x => x.productId !== id));
    this.wishlist.update(w => w.filter(x => x !== id));
    this.toast('Product deleted', 'info');
  }
  addReview(productId: number, rating: number, text: string) {
    const u = this.user(); if (!u) return;
    this.products.update(ps => ps.map(p => {
      if (p.id !== productId) return p;
      const reviews = [{ user: u.name, rating, text, date: new Date().toISOString().slice(0, 10) }, ...p.reviews];
      const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
      return { ...p, reviews, rating: Math.round(avg * 10) / 10, reviewCount: p.reviewCount + 1 };
    }));
    this.toast('Thanks for your review');
  }

  resetDemo() {
    Object.values(K).forEach(k => localStorage.removeItem(k));
    location.href = '/';
  }

  // ---------- toasts ----------
  toast(text: string, kind: Toast['kind'] = 'ok') {
    const id = ++this.toastId;
    this.toasts.update(t => [...t.slice(-2), { id, text, kind }]);
    setTimeout(() => this.toasts.update(t => t.filter(x => x.id !== id)), 3200);
  }
  dismissToast(id: number) { this.toasts.update(t => t.filter(x => x.id !== id)); }
}
