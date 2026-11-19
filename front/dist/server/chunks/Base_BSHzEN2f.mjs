import { c as createAstro, a as createComponent, r as renderTemplate, e as renderSlot, f as renderHead, u as unescapeHTML, b as addAttribute, m as maybeRenderHead, d as renderComponent, F as Fragment } from './astro/server_O3v_sucX.mjs';
import 'kleur/colors';
/* empty css                         */

const pwaInfo = {"pwaInDevEnvironment":false,"webManifest":{"href":"/manifest.webmanifest","useCredentials":false,"linkTag":"<link rel=\"manifest\" href=\"/manifest.webmanifest\">"}};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://embedia.netlify.app");
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const {
    title = "Embedia — Componentes y SBC para sistemas embebidos",
    description = "Compra microcontroladores, SBC, sensores y herramientas de laboratorio. Envío en 24h y pago con tarjeta u OXXO.",
    noindex = false,
    image = "/og-default.svg",
    preloadImage = ""
  } = Astro2.props;
  const site = Astro2.site ?? new URL("https://embedia.netlify.app");
  const canonical = new URL(Astro2.url.pathname, site).toString();
  const ogImage = new URL(image, site).toString();
  const robots = noindex ? "noindex,nofollow" : "index,follow";
  const backendOrigin = (() => {
    const raw = String("https://embedia-production.up.railway.app/").trim();
    if (!raw) return "";
    try {
      return new URL(raw).origin;
    } catch {
      return "";
    }
  })();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "Embedia", url: site.toString(), logo: new URL("/favicon.svg", site).toString() },
      { "@type": "WebSite", name: "Embedia", url: site.toString() }
    ]
  };
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#ff6b1a"><meta name="description"', '><meta name="robots"', '><link rel="canonical"', '><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/icons/pwa-192x192.png"><title>', "</title>", '<meta property="og:type" content="website"><meta property="og:site_name" content="Embedia"><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:image"', '><meta property="og:locale" content="es_MX"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', ">", `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" media="print" onload="this.media='all'">`, '<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"></noscript>', '<script type="application/ld+json">', "</script>", '</head> <body class="min-h-screen bg-background text-foreground antialiased font-sans"> <a href="#main" class="skip-link">Saltar al contenido</a> ', "  </body> </html>"])), addAttribute(description, "content"), addAttribute(robots, "content"), addAttribute(canonical, "href"), title, pwaInfo && pwaInfo.webManifest && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(pwaInfo.webManifest.linkTag)}` })}`, addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(canonical, "content"), addAttribute(ogImage, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(ogImage, "content"), backendOrigin && renderTemplate`<link rel="preconnect"${addAttribute(backendOrigin, "href")} crossorigin>`, maybeRenderHead(), preloadImage && renderTemplate`<link rel="preload" as="image"${addAttribute(preloadImage, "href")} fetchpriority="high">`, unescapeHTML(JSON.stringify(jsonLd)), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/home/orange/Projects/PW2/PWA/front/src/layouts/Base.astro", void 0);

export { $$Base as $ };
