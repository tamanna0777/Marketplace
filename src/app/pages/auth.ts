import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-auth', standalone: true, imports: [ReactiveFormsModule, RouterLink],
  template: `
  <div class="container auth">
    <div class="card pad auth-card">
      <div class="tabs" role="tablist">
        <a role="tab" routerLink="/login" [queryParams]="keep()" [class.on]="mode() === 'login'">Sign in</a>
        <a role="tab" routerLink="/register" [queryParams]="keep()" [class.on]="mode() === 'register'">Create account</a>
      </div>

      @if (mode() === 'login') {
        <form class="form" [formGroup]="lf" (ngSubmit)="login()" novalidate>
          <label>Email<input type="email" formControlName="email" autocomplete="email">@if (bad(lf, 'email')) { <small class="err">Enter a valid email</small> }</label>
          <label>Password<input type="password" formControlName="password" autocomplete="current-password">@if (bad(lf, 'password')) { <small class="err">Enter your password</small> }</label>
          @if (error()) { <p class="err-box">{{ error() }}</p> }
          <button class="btn btn-lg">Sign in</button>
        </form>
        <div class="demo">
          <p class="small muted">Try a demo account (password demo123)</p>
          <div class="chips">
            <button class="chip" (click)="fill('customer@demo.com')">Customer</button>
            <button class="chip" (click)="fill('kalakriti@demo.com')">Seller: Kalakriti</button>
            <button class="chip" (click)="fill('gadget@demo.com')">Seller: Gadget Gully</button>
          </div>
        </div>
      } @else {
        <form class="form" [formGroup]="rf" (ngSubmit)="register()" novalidate>
          <div class="seg" role="radiogroup" aria-label="Account type">
            <label [class.on]="rf.value.role === 'customer'"><input type="radio" formControlName="role" value="customer">I want to buy</label>
            <label [class.on]="rf.value.role === 'vendor'"><input type="radio" formControlName="role" value="vendor">I want to sell</label>
          </div>
          <label>Your name<input formControlName="name" autocomplete="name">@if (bad(rf, 'name')) { <small class="err">Enter your name</small> }</label>
          <label>Email<input type="email" formControlName="email" autocomplete="email">@if (bad(rf, 'email')) { <small class="err">Enter a valid email</small> }</label>
          <label>Password<input type="password" formControlName="password" autocomplete="new-password">@if (bad(rf, 'password')) { <small class="err">Use at least 6 characters</small> }</label>
          @if (rf.value.role === 'vendor') {
            <label>Store name<input formControlName="storeName">@if (bad(rf, 'storeName')) { <small class="err">Give your store a name</small> }</label>
            <label>City<input formControlName="city"></label>
          }
          @if (error()) { <p class="err-box">{{ error() }}</p> }
          <button class="btn btn-lg">{{ rf.value.role === 'vendor' ? 'Open my store' : 'Create account' }}</button>
        </form>
      }
    </div>
  </div>`,
})
export class AuthPage implements OnInit {
  store = inject(StoreService); router = inject(Router); route = inject(ActivatedRoute); fb = inject(FormBuilder);
  mode = signal<'login' | 'register'>('login');
  error = signal('');
  lf = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  rf = this.fb.nonNullable.group({
    role: ['customer' as 'customer' | 'vendor'], name: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]], storeName: [''], city: [''],
  });
  ngOnInit() {
    this.route.data.subscribe(d => { this.mode.set(d['mode']); this.error.set(''); });
    this.route.queryParamMap.subscribe(m => { if (m.get('role') === 'vendor') this.rf.patchValue({ role: 'vendor' }); });
    this.rf.get('role')!.valueChanges.subscribe(r => {
      const s = this.rf.get('storeName')!; s.setValidators(r === 'vendor' ? Validators.required : []); s.updateValueAndValidity();
    });
    if (this.rf.value.role === 'vendor') this.rf.get('storeName')!.setValidators(Validators.required);
  }
  keep() { const n = this.route.snapshot.queryParamMap.get('next'); return n ? { next: n } : {}; }
  bad(f: any, c: string) { const x = f.get(c); return x.invalid && (x.touched || x.dirty); }
  fill(email: string) { this.lf.setValue({ email, password: 'demo123' }); this.error.set(''); }
  private done(u: { role: string }) {
    const next = this.route.snapshot.queryParamMap.get('next');
    this.router.navigateByUrl(next ?? (u.role === 'vendor' ? '/seller' : '/'));
  }
  login() {
    if (this.lf.invalid) { this.lf.markAllAsTouched(); return; }
    const u = this.store.login(this.lf.value.email!, this.lf.value.password!);
    if (!u) { this.error.set('Email or password is incorrect. Check them and try again.'); return; }
    this.done(u);
  }
  register() {
    if (this.rf.invalid) { this.rf.markAllAsTouched(); return; }
    const v = this.rf.getRawValue();
    const r = this.store.register(v);
    if (!r.ok) { this.error.set(r.error!); return; }
    this.done(this.store.user()!);
  }
}
