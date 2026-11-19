import { e as defineMiddleware, s as sequence } from './chunks/render-context_CMf2s-oZ.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_D6_NYAOI.mjs';
import '@astrojs/internal-helpers/path';
import 'cookie';

const BACKEND = "http://localhost:4000";
const PUBLIC_BACKEND_URL = String("").trim();
const PROXY_EXACT = ["/graphql"];
const PROXY_PREFIX = ["/auth", "/api", "/upload", "/uploads"];
const onRequest$1 = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/admin")) {
    const adminFlag = context.cookies.get("embedia_admin")?.value;
    if (adminFlag !== "1") return context.redirect("/");
    try {
      const cookieHeader = context.request.headers.get("cookie") ?? "";
      const res = await fetch(`${BACKEND}/auth/me`, {
        headers: {
          cookie: cookieHeader
        },
        cache: "no-store"
      });
      if (!res.ok) return context.redirect("/");
      const data = await res.json();
      if (!data?.usuario || data.usuario.rol !== "ADMIN") return context.redirect("/");
      context.locals.usuario = data.usuario;
    } catch {
      return context.redirect("/");
    }
    return next();
  }
  if (PUBLIC_BACKEND_URL) return next();
  const path = context.url.pathname;
  const needsProxy = PROXY_EXACT.includes(path) || PROXY_PREFIX.some((p) => path === p || path.startsWith(p + "/"));
  if (!needsProxy) return next();
  return proxyToBackend(context);
});
async function proxyToBackend(context) {
  const target = new URL(context.url.pathname + context.url.search, BACKEND);
  const headers = new Headers(context.request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");
  const init = {
    method: context.request.method,
    headers,
    redirect: "manual"
  };
  if (context.request.body) {
    init.body = context.request.body;
    init.duplex = "half";
  }
  let res;
  try {
    res = await fetch(target, init);
  } catch (err) {
    console.error("[proxy] backend unreachable:", err);
    return new Response(JSON.stringify({
      error: "Backend no disponible"
    }), {
      status: 502,
      headers: {
        "content-type": "application/json"
      }
    });
  }
  const responseHeaders = new Headers();
  for (const [k, v] of res.headers.entries()) {
    if (k.toLowerCase() === "set-cookie") continue;
    responseHeaders.set(k, v);
  }
  const getSetCookie = res.headers.getSetCookie;
  if (typeof getSetCookie === "function") {
    for (const c of getSetCookie.call(res.headers)) {
      responseHeaders.append("set-cookie", c);
    }
  }
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders
  });
}

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
