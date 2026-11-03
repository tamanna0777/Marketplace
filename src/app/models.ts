export interface Vendor { id: string; name: string; tagline: string; city: string; emoji: string; color: string; rating: number; since: number; about: string; }
export interface Category { id: string; name: string; emoji: string; color: string; }
export interface Review { user: string; rating: number; text: string; date: string; }
export interface Product {
  id: number; vendorId: string; category: string; name: string; price: number; mrp: number; stock: number;
  rating: number; reviewCount: number; emoji: string; color: string; description: string; tags: string[];
  reviews: Review[]; createdAt: string;
}
export interface User { id: string; name: string; email: string; password: string; role: 'customer' | 'vendor'; vendorId?: string; }
export type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Delivered';
export interface OrderItem { productId: number; name: string; vendorId: string; price: number; qty: number; emoji: string; color: string; }
export interface Order {
  id: string; userId: string; customer: string; date: string; items: OrderItem[];
  subtotal: number; shipping: number; discount: number; total: number;
  status: OrderStatus; address: string; payment: string;
}
export interface CartLine { product: Product; qty: number; }
export interface CartGroup { vendor: Vendor; lines: CartLine[]; subtotal: number; shipping: number; }
export interface Toast { id: number; text: string; kind: 'ok' | 'err' | 'info'; }
export const STATUSES: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Delivered'];
