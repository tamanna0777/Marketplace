# MarketHub – Multi-vendor e-commerce marketplace (Angular 18)

Pure front-end project. The "database" is JSON in `src/assets/data/` (vendors, categories, products, users, orders).
Anything you change at runtime (cart, wishlist, orders, new products, new accounts) is saved in the browser's localStorage.

## Run
```bash
npm install
npm start        # http://localhost:4200
```

## Demo accounts (password: demo123)
- Customer: customer@demo.com
- Seller: kalakriti@demo.com, gadget@demo.com
- Or register your own customer / seller account.

## Features
- Home, category tiles, deals, top-rated, seller spotlight
- Shop: search, category, seller, price slider, rating, in-stock, sort, URL-synced filters, mobile filter drawer
- Product page: quantity, buy now, wishlist, reviews (post your own), more from seller, related products
- Seller stores and a sellers directory
- Multi-vendor cart: grouped by seller, per-seller delivery (free above ₹499), coupons WELCOME10 / HAAT200
- Checkout with validated address + UPI / Card / COD, order confirmation split into parcels
- Auth (login/register as buyer or seller) with route guards
- Customer account: order tracking, wishlist
- Seller dashboard: revenue chart, stock alerts, product CRUD, order status updates
- Dark mode, keyboard focus, reduced-motion, responsive layout

Use "Reset demo data" in the footer to restore the original JSON data.
Structure: `src/app/store.service.ts` (state, signals), `src/app/pages/*` (routed pages), `src/app/shared.ts` (reusable components).
