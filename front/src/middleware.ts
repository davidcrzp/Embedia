import { defineMiddleware } from 'astro:middleware';
const BACKEND = import.meta.env.BACKEND_URL ?? 'http://localhost:4000';
const PUBLIC_BACKEND_URL = String(import.meta.env.PUBLIC_BACKEND_URL ?? '').trim();
const PROXY_EXACT = ['/graphql'];
const PROXY_PREFIX = ['/auth', '/api', '/upload', '/uploads'];
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith('/admin')) {
    const adminFlag = context.cookies.get('embedia_admin')?.value;
    if (adminFlag !== '1') return context.redirect('/');
    try {
      const cookieHeader = context.request.headers.get('cookie') ?? '';
      const res = await fetch(`${BACKEND}/auth/me`, { headers: { cookie: cookieHeader }, cache: 'no-store' });
      if (!res.ok) return context.redirect('/');
      const data = (await res.json()) as { usuario?: { rol: string } | null };
      if (!data?.usuario || data.usuario.rol !== 'ADMIN') return context.redirect('/');
      context.locals.usuario = data.usuario as App.Locals['usuario'];
    } catch { return context.redirect('/'); }
    return next();
  }
  if (PUBLIC_BACKEND_URL) return next();
  const path = context.url.pathname;
  const needsProxy = PROXY_EXACT.includes(path) || PROXY_PREFIX.some((p) => path === p || path.startsWith(p + '/'));
  if (!needsProxy) return next();
  return proxyToBackend(context);
});
async function proxyToBackend(context: any): Promise<Response> {
  const target = new URL(context.url.pathname + context.url.search, BACKEND);
  const headers = new Headers(context.request.headers);
  headers.delete('host'); headers.delete('connection'); headers.delete('content-length'); headers.delete('accept-encoding');
  const init: RequestInit & { duplex?: 'half' } = { method: context.request.method, headers, redirect: 'manual' };
  if (context.request.body) { init.body = context.request.body; init.duplex = 'half'; }
  let res: Response;
  try { res = await fetch(target, init); } catch (err) {
    console.error('[proxy] backend unreachable:', err);
    return new Response(JSON.stringify({ error: 'Backend no disponible' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
  const responseHeaders = new Headers();
  for (const [k, v] of res.headers.entries()) { if (k.toLowerCase() === 'set-cookie') continue; responseHeaders.set(k, v); }
  const getSetCookie = (res.headers as any).getSetCookie;
  if (typeof getSetCookie === 'function') { for (const c of getSetCookie.call(res.headers) as string[]) { responseHeaders.append('set-cookie', c); } }
  responseHeaders.delete('content-encoding'); responseHeaders.delete('content-length');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: responseHeaders });
}
