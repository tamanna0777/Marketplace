# 🛍️ MarketHub – Multi-Vendor E-Commerce Marketplace

<p align="center">
  <strong>A modern, responsive marketplace connecting customers and multiple sellers through a unified shopping experience.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-18-DD0031?logo=angular&logoColor=white" alt="Angular 18">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Project Status">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
</p>

---

## 📌 Overview

**MarketHub** is a front-end multi-vendor e-commerce marketplace application developed using Angular 18.

The platform provides a unified digital shopping environment where multiple sellers can showcase and manage their products while customers can discover products, compare offerings, manage shopping carts, place orders and track their purchases.

Unlike a traditional single-vendor shopping application, MarketHub supports multiple independent sellers within one marketplace.

The application demonstrates essential e-commerce workflows through a responsive user interface, role-based navigation, interactive components and browser-based data persistence.

### 🎯 Project Objectives

- Build a multi-vendor e-commerce shopping experience.
- Provide separate experiences for customers and sellers.
- Simplify product discovery through search and filtering.
- Implement shopping cart and checkout workflows.
- Provide sellers with product and order management capabilities.
- Create a responsive and accessible user interface.

---

## ✨ Key Features

### 🏠 1. Home & Product Discovery
- Interactive homepage with product categories.
- Featured deals and top-rated products.
- Seller spotlight section.
- Category-based product navigation.

### 🔍 2. Product Browsing & Search
- Search products by keywords.
- Filter by category and seller.
- Price range filtering.
- Product rating filters.
- In-stock product filtering.
- Sorting functionality.
- URL-synchronized filters.
- Mobile-friendly filter drawer.

### 🛒 3. Shopping Cart
- Add and remove products.
- Update product quantities.
- Multi-vendor cart management.
- Products grouped according to their sellers.
- Seller-specific delivery calculations.
- Coupon application.

**Available demo coupons:**
- `WELCOME10`
- `HAAT200`

### 📦 4. Product Details
- Detailed product information.
- Product quantity selection.
- Buy Now functionality.
- Wishlist management.
- Customer reviews.
- Related product recommendations.
- More products from the same seller.

### 👤 5. Authentication & User Management
- Customer registration and login.
- Seller registration and login.
- Role-based navigation.
- Route guards for protected pages.
- Separate customer and seller experiences.

### 💳 6. Checkout & Order Management
- Address validation.
- Multiple checkout payment options:
  - UPI
  - Card
  - Cash on Delivery (COD)
- Order confirmation.
- Multi-vendor order splitting into seller-specific parcels.

**Note:** Payment options are part of the front-end demonstration. No real payment processing is performed.

### 📊 7. Seller Dashboard
- Seller dashboard with revenue visualization.
- Inventory and stock alerts.
- Add new products.
- Edit existing products.
- Delete products.
- Manage customer orders.
- Update order statuses.

### ❤️ 8. Customer Account
- View order history.
- Track orders.
- Manage wishlist.
- Access customer account information.

### 🎨 9. UI/UX & Accessibility
- Responsive layout.
- Dark mode support.
- Keyboard navigation and focus states.
- Reduced-motion support.
- Mobile-friendly interface.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Angular 18 | Front-end application framework |
| TypeScript | Application logic and type safety |
| HTML5 | Application structure |
| CSS3 | Styling and responsive layouts |
| Angular Router | Navigation and routing |
| Angular Signals | Reactive application state |
| RxJS | Reactive programming |
| Browser LocalStorage | Client-side data persistence |
| JSON | Initial application data |

### Development Tools

- Visual Studio Code
- Node.js
- npm
- Angular CLI
- Git
- GitHub

---

## 🏗️ Application Architecture

MarketHub follows a component-based Angular architecture.

The application separates reusable UI components, routed pages, application state and initial data.

### Main Application Components

| Component | Responsibility |
|---|---|
| Store Service | Application state and data management |
| Pages | Individual application screens |
| Shared Components | Reusable UI components |
| Angular Router | Navigation between application pages |
| LocalStorage | Persistence of user-generated changes |

### Project Structure

```text
Marketplace/
│
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── Home
│   │   │   ├── Shop
│   │   │   ├── Product Details
│   │   │   ├── Cart
│   │   │   ├── Checkout
│   │   │   ├── Customer Account
│   │   │   └── Seller Dashboard
│   │   │
│   │   ├── store.service.ts
│   │   └── shared.ts
│   │
│   └── assets/
│       └── data/
│
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── .gitignore
└── README.md
```

*Note: This is a logical overview of the main application areas; individual filenames may differ.*

---

## ⚙️ Installation & Setup

Follow these instructions to run MarketHub locally.

### Prerequisites

Make sure the following are installed:

- Node.js (20.x recommended)
- npm
- Git
- Visual Studio Code (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/tamanna0777/Marketplace.git
```

### Step 2: Navigate to the Project

```bash
cd Marketplace
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm start
```

Alternatively:

```bash
npx ng serve --open
```

### Step 5: Open the Application

Visit:

```text
http://localhost:4200/
```

The application will automatically reload when source files are modified.

### Production Build

To generate a production build:

```bash
npm run build
```

The generated build files will be available in the `dist/` directory.

---

## 🔐 Demo Login Credentials

The application includes predefined demo accounts for testing customer and seller functionality.

**Demo Password:** `demo123`

| User Role | Email |
|---|---|
| Customer | customer@demo.com |
| Seller | kalakriti@demo.com |
| Seller | gadget@demo.com |

You can also register your own customer or seller account.

**Important:** These are demonstration credentials for the front-end application, not production authentication accounts.

---

## 💾 Data Management

MarketHub currently uses a front-end data management approach.

- Initial marketplace data is stored in JSON files under `src/assets/data/`.
- Runtime changes are persisted using browser LocalStorage.
- Cart items, wishlist entries, orders, newly registered accounts and product changes are maintained in the browser.
- The footer provides a **Reset Demo Data** option to restore the original demonstration dataset.

### Current Implementation Scope

This version is a front-end demonstration.

It does not currently include:
- A connected production database.
- A backend API or server.
- Real payment gateway integration.
- Production-grade authentication and authorization.

---

## 🚀 Future Enhancements

Potential improvements for future versions include:

- Backend development using Node.js and Express.
- Database integration using MongoDB or MySQL.
- Secure authentication using JWT.
- Real payment gateway integration.
- Cloud-based image and product storage.
- Email and order notifications.
- Advanced analytics for sellers.
- Deployment with a production hosting platform.

---

## 🧪 Testing the Application

You can explore the following workflows:

1. Register or log in as a customer.
2. Browse products and apply filters.
3. Add products from different sellers to the cart.
4. Apply an available coupon.
5. Complete the demonstration checkout process.
6. View customer orders and order tracking.
7. Log in as a seller.
8. Add, edit or remove products.
9. Manage orders through the seller dashboard.
10. Test dark mode and responsive layouts.

---

## 👩‍💻 Developer

**Developed and maintained by Tamanna Shaikh**

- GitHub: [@tamanna0777](https://github.com/tamanna0777)
- Project Repository: [MarketHub](https://github.com/tamanna0777/Marketplace)

---

## 📄 License

This project is intended for educational and demonstration purposes.

A formal open-source license should be added separately if the project is intended for redistribution or reuse.

---

<p align="center">
  <strong>MarketHub – One Marketplace. Multiple Sellers. Endless Possibilities.</strong>
</p>