const RAW_BACKEND = String(import.meta.env.PUBLIC_BACKEND_URL ?? '').trim().replace(/\/+$/, '');
export function backendUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return RAW_BACKEND ? `${RAW_BACKEND}${p}` : p;
}
export const API_URL = backendUrl(String(import.meta.env.PUBLIC_API_URL ?? '/graphql'));
export const REALTIME_URL = (() => {
  const explicit = String(import.meta.env.PUBLIC_REALTIME_URL ?? '').trim();
  if (explicit) return explicit;
  if (RAW_BACKEND) return `${RAW_BACKEND}/graphql`;
  if (typeof location !== 'undefined') return `${location.protocol}//${location.hostname}:4000/graphql`;
  return '/graphql';
})();
