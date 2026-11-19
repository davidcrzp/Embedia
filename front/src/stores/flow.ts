import { signal } from '@preact/signals';
import type { Producto, Vista } from '../lib/types';
export const view = signal<Vista>('home');
export const categoriaSeleccionada = signal<{ id: string; nombre: string } | null>(null);
export const productoModal = signal<Producto | null>(null);
export const catalogVersion = signal(0);
export function bumpCatalogVersion() { catalogVersion.value += 1; }
export function irAHome() { view.value = 'home'; productoModal.value = null; categoriaSeleccionada.value = null; }
export function elegirCategoria(id: string, nombre: string) { categoriaSeleccionada.value = { id, nombre }; view.value = 'categoria'; productoModal.value = null; }
export function irAlCarrito() { productoModal.value = null; view.value = 'carrito'; }
export function irAlCheckout() { productoModal.value = null; view.value = 'checkout'; }
export function irAMisPedidos() { productoModal.value = null; view.value = 'pedidos'; }
export function pedidoCreado() { view.value = 'pedidos'; categoriaSeleccionada.value = null; bumpCatalogVersion(); }
export function abrirProductoModal(p: Producto) { productoModal.value = { ...p, categoria: p.categoria ? { ...p.categoria } : undefined }; }
