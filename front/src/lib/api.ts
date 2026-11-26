import { API_URL, backendUrl } from './urls';

export function imgUrl(path: unknown): string {
  if (typeof path !== 'string' || path.length === 0) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return backendUrl(path);
}

export function productImageSrcSet(path: unknown, widths: number[] = [300, 600]): string | undefined {
  if (typeof path !== 'string' || !/images\.unsplash\.com/.test(path)) return undefined;
  return widths.map((w) => `${path.replace(/w=\d+/, `w=${w}`)} ${w}w`).join(', ');
}

export type GqlError = { message: string; extensions?: Record<string, any>; path?: (string | number)[] };
export class ApiError extends Error {
  errors: GqlError[];
  constructor(errors: GqlError[]) {
    super(errors.map((e) => e.message).join(' | ') || 'Error GraphQL');
    this.errors = errors;
  }
}

export async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    credentials: 'include', body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json(); if (json.errors?.length) throw new ApiError(json.errors); return json.data as T;
}
export async function authLogin(email: string, password: string) {
  const res = await fetch(backendUrl('/auth/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
  const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(String(data?.error ?? 'Credenciales inválidas')); return data as { usuario: import('./types').Usuario };
}
export async function authRegister(nombre: string, email: string, password: string) {
  const res = await fetch(backendUrl('/auth/register'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ nombre, email, password }) });
  const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(String(data?.error ?? 'No se pudo registrar')); return data as { usuario: import('./types').Usuario };
}
export async function authLogout() { await fetch(backendUrl('/auth/logout'), { method: 'POST', credentials: 'include' }); }
export async function authMe(): Promise<import('./types').Usuario | null> {
  try {
    const res = await fetch(backendUrl('/auth/me'), {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.usuario ?? null;
  } catch {
    return null;
  }
}
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData(); form.append('image', file);
  const res = await fetch(backendUrl('/upload'), { method: 'POST', credentials: 'include', body: form });
  if (!res.ok) { const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` })); throw new Error(String(data?.error ?? `Error al subir (${res.status})`)); }
  const data = await res.json(); return String(data?.url ?? '');
}
