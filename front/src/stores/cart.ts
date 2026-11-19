import { signal, computed } from '@preact/signals';
import type { CartItem, Producto } from '../lib/types';
const STORAGE_KEY = 'embedia-cart';
function load(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return []; const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}
export const cartItems = signal<CartItem[]>(load());
function persist(items: CartItem[]) { if (typeof window === 'undefined') return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {} }
function copy(p: Producto): Producto { return { ...p, categoria: p.categoria ? { ...p.categoria } : undefined }; }
export function addToCart(p: Producto, cantidad: number) {
  const list = cartItems.value; const found = list.find((i) => i.producto.id === p.id);
  const next = found ? list.map((i) => i.producto.id === p.id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, p.stock) } : i) : [...list, { producto: copy(p), cantidad: Math.min(cantidad, p.stock) }];
  cartItems.value = next; persist(next);
}
export function removeFromCart(id: string) { const next = cartItems.value.filter((i) => i.producto.id !== id); cartItems.value = next; persist(next); }
export function updateCartQuantity(id: string, cantidad: number) {
  const next = cartItems.value.map((i) => {
    if (i.producto.id !== id) return i; const max = Math.max(1, Math.floor(Number(i.producto.stock) || 1)); const n = Math.max(1, Math.min(Math.floor(cantidad), max)); return { ...i, cantidad: n };
  }); cartItems.value = next; persist(next);
}
export function clearCart() { cartItems.value = []; if (typeof window !== 'undefined') { try { localStorage.removeItem(STORAGE_KEY); } catch {} } }
export const cartCount = computed(() => cartItems.value.reduce((s, i) => s + i.cantidad, 0));
export const cartTotal = computed(() => cartItems.value.reduce((s, i) => s + i.cantidad * i.producto.precio, 0));
