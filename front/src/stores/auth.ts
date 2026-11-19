import { signal } from '@preact/signals';
import { authLogin, authLogout, authMe, authRegister } from '../lib/api';
import { clearCart } from './cart';
import type { Usuario } from '../lib/types';
export const currentUser = signal<Usuario | null>(null);
export const authLoading = signal(true);
let bootstrapped = false;
export async function bootstrapAuth() { if (bootstrapped) return; bootstrapped = true; try { currentUser.value = await authMe(); } finally { authLoading.value = false; } }
export async function registrar(nombre: string, email: string, password: string) { const { usuario } = await authRegister(nombre, email, password); currentUser.value = usuario; }
export async function login(email: string, password: string) { const { usuario } = await authLogin(email, password); currentUser.value = usuario; }
export async function logout() { try { await authLogout(); } finally { clearCart(); currentUser.value = null; window.location.href = '/'; } }
