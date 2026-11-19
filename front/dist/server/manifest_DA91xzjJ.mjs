import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import './chunks/astro-designed-error-pages_D6_NYAOI.mjs';
import 'es-module-lexer';
import { g as decodeKey } from './chunks/astro/server_O3v_sucX.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_F0FVQw6Y.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/orange/Projects/PW2/PWA/front/","adapterName":"@astrojs/node","routes":[{"file":"login/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"robots.txt","links":[],"scripts":[],"styles":[],"routeData":{"route":"/robots.txt","isIndex":false,"type":"endpoint","pattern":"^\\/robots\\.txt\\/?$","segments":[[{"content":"robots.txt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/robots.txt.ts","pathname":"/robots.txt","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.HKfDcGRO.js"}],"styles":[{"type":"external","src":"/_astro/admin.BNIFuYi_.css"},{"type":"external","src":"/_astro/index.Dgihpmma.css"}],"routeData":{"route":"/admin","isIndex":false,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.HKfDcGRO.js"}],"styles":[{"type":"external","src":"/_astro/admin.BNIFuYi_.css"},{"type":"external","src":"/_astro/index.Dgihpmma.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://embedia.netlify.app","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/orange/Projects/PW2/PWA/front/src/pages/admin.astro",{"propagation":"none","containsHead":true}],["/home/orange/Projects/PW2/PWA/front/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/home/orange/Projects/PW2/PWA/front/src/pages/login.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/admin@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/robots.txt@_@ts":"pages/robots.txt.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","/home/orange/Projects/PW2/PWA/front/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","/home/orange/Projects/PW2/PWA/front/node_modules/leaflet/dist/leaflet.css":"_astro/index.95d291e9.Cj3BFM-9.js","\u0000@astrojs-manifest":"manifest_DA91xzjJ.mjs","/home/orange/Projects/PW2/PWA/front/src/islands/views/CategoriaView.tsx":"_astro/CategoriaView.CB1Ua6oe.js","/home/orange/Projects/PW2/PWA/front/src/islands/views/CarritoView.tsx":"_astro/CarritoView.DK1S-ozz.js","/home/orange/Projects/PW2/PWA/front/src/islands/views/CheckoutView.tsx":"_astro/CheckoutView.D9BY5hfh.js","/home/orange/Projects/PW2/PWA/front/src/islands/views/PedidosView.tsx":"_astro/PedidosView.BoLBAL4q.js","/home/orange/Projects/PW2/PWA/front/src/islands/ProductModal.tsx":"_astro/ProductModal.NG7I5zTE.js","/home/orange/Projects/PW2/PWA/front/src/islands/CartBadge.tsx":"_astro/CartBadge.C19SFLDB.js","/home/orange/Projects/PW2/PWA/front/src/islands/CartSummary.tsx":"_astro/CartSummary.CFH8qAn7.js","/home/orange/Projects/PW2/PWA/front/src/islands/LoginForm.tsx":"_astro/LoginForm.DPP4c1Av.js","/home/orange/Projects/PW2/PWA/front/src/islands/PedidosBadge.tsx":"_astro/PedidosBadge.DtSQb92c.js","/home/orange/Projects/PW2/PWA/front/src/islands/SidebarList.tsx":"_astro/SidebarList.CX0olWtu.js","/home/orange/Projects/PW2/PWA/front/src/islands/UserMenu.tsx":"_astro/UserMenu.MNd3Ykzi.js","/home/orange/Projects/PW2/PWA/front/node_modules/workbox-window/build/workbox-window.prod.es5.mjs":"_astro/workbox-window.prod.es5.BqEJf4Xk.js","/astro/hoisted.js?q=0":"_astro/hoisted.HKfDcGRO.js","@astrojs/preact/client.js":"_astro/client.DIxiegXj.js","/home/orange/Projects/PW2/PWA/front/node_modules/@preact/signals/dist/signals.module.js":"_astro/signals.module.BlTeirG6.js","/home/orange/Projects/PW2/PWA/front/src/islands/AdminApp.tsx":"_astro/AdminApp.CrP3wDWN.js","/home/orange/Projects/PW2/PWA/front/src/islands/CETIMap.tsx":"_astro/CETIMap.DbgNof4q.js","/home/orange/Projects/PW2/PWA/front/src/islands/ShopApp.tsx":"_astro/ShopApp.CEE5oRFP.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/admin.BNIFuYi_.css","/_astro/index.Dgihpmma.css","/manifest.webmanifest","/favicon.svg","/og-default.svg","/_astro/AdminApp.CrP3wDWN.js","/_astro/CETIMap.DbgNof4q.js","/_astro/CarritoView.DK1S-ozz.js","/_astro/CartBadge.C19SFLDB.js","/_astro/CartSummary.CFH8qAn7.js","/_astro/CategoriaView.CB1Ua6oe.js","/_astro/CheckoutView.D9BY5hfh.js","/_astro/LoginForm.DPP4c1Av.js","/_astro/PedidosBadge.DtSQb92c.js","/_astro/PedidosView.BoLBAL4q.js","/_astro/ProductModal.NG7I5zTE.js","/_astro/ShopApp.CEE5oRFP.js","/_astro/ShopApp.CQEwAIoI.js","/_astro/SidebarList.CX0olWtu.js","/_astro/UserMenu.MNd3Ykzi.js","/_astro/auth.C8KoUq5Y.js","/_astro/button.BBEIJcn7.js","/_astro/cart.D-1g8NQZ.js","/_astro/client.DIxiegXj.js","/_astro/cn.d2XQ1MEC.js","/_astro/dialog.CNkCEzPC.js","/_astro/flow.CTOOFxfc.js","/_astro/format.ChtFUdmz.js","/_astro/hoisted.HKfDcGRO.js","/_astro/hooks.module.DnjPSNWh.js","/_astro/input.1rjeTVcD.js","/_astro/jsxRuntime.module.BmzItdFi.js","/_astro/label.D8f9J6hE.js","/_astro/leaflet-src.DTmlu4rB.js","/_astro/preact.module.OJoxIo0S.js","/_astro/preload-helper.CLcXU_4U.js","/_astro/signals.module.BlTeirG6.js","/_astro/skeleton.BidL88Ej.js","/_astro/workbox-window.prod.es5.BqEJf4Xk.js","/icons/pwa-192x192.png","/icons/pwa-512x512.png","/icons/pwa-maskable-512x512.png","/login/index.html","/robots.txt"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"eMTwBKAz2ztptPPkbnE5p97W257CkZFGb4qbYZdpTto=","experimentalEnvGetSecretEnabled":false});

export { manifest };
