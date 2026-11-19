import { a as createComponent, m as maybeRenderHead, d as renderComponent, r as renderTemplate, b as addAttribute } from './astro/server_O3v_sucX.mjs';
import 'kleur/colors';
import { $ as $$Base } from './Base_BFlhnPro.mjs';
import { c as categoriaSeleccionada, i as irAHome, b as cn, e as elegirCategoria, d as cartTotal, f as cartCount, g as catalogVersion, B as Button, p as productImageSrcSet, h as imgUrl, j as abrirProductoModal, k as gql, v as view, l as bootstrapAuth, $ as $$TopBar, a as $$Footer } from './Footer_BKSbCEz3.mjs';
import { jsx, jsxs, Fragment } from 'preact/jsx-runtime';
import 'clsx';
import { signal, computed } from '@preact/signals';
import { useRef, useEffect, useState } from 'preact/hooks';
import { lazy, useEffect as useEffect$1, Suspense } from 'preact/compat';
import { cva } from 'class-variance-authority';
import '../renderers.mjs';

function SidebarList({
  categorias
}) {
  const activa = categoriaSeleccionada.value?.id;
  const base = "whitespace-nowrap rounded-sm border px-3 py-1.5 text-sm transition-colors lg:w-full lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-l-2 lg:py-1.5 lg:pl-3 lg:pr-0 lg:text-left";
  const active = "border-primary bg-primary/10 text-primary lg:border-l-primary lg:bg-transparent lg:text-foreground";
  const inactive = "border-border text-muted hover:border-border-strong hover:text-foreground lg:border-l-transparent lg:hover:border-l-border-strong lg:hover:bg-transparent";
  return jsx("nav", {
    "aria-label": "Categorías del catálogo",
    children: jsxs("ul", {
      class: "flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:space-y-0.5 lg:gap-0 lg:overflow-x-visible lg:pb-0",
      children: [jsx("li", {
        class: "shrink-0 lg:w-full",
        children: jsx("button", {
          onClick: irAHome,
          class: cn(base, !activa ? active : inactive),
          children: "Todos"
        })
      }), categorias.map((c) => {
        const isActive = activa === c.id;
        return jsx("li", {
          class: "shrink-0 lg:w-full",
          children: jsx("button", {
            onClick: () => elegirCategoria(c.id, c.nombre),
            class: cn(base, isActive ? active : inactive),
            children: c.nombre
          })
        }, c.id);
      })]
    })
  });
}

const $$Sidebar = createComponent(async ($$result, $$props, $$slots) => {
  const BACKEND = "http://localhost:4000";
  let categorias = [];
  try {
    const res = await fetch(`${BACKEND}/graphql`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "{ categorias { id nombre } }" }) });
    const json = await res.json();
    categorias = Array.isArray(json?.data?.categorias) ? json.data.categorias : [];
  } catch {
    categorias = [];
  }
  return renderTemplate`${maybeRenderHead()}<aside class="min-w-0 h-fit border-b border-border pb-3 lg:sticky lg:top-20 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0"> <p class="mb-3 hidden text-label font-medium uppercase text-muted lg:block">Catálogo</p> ${renderComponent($$result, "SidebarList", SidebarList, { "client:visible": true, "categorias": categorias, "client:component-hydration": "visible", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/SidebarList.tsx", "client:component-export": "default" })} </aside>`;
}, "/home/orange/Projects/PW2/PWA/front/src/components/Sidebar.astro", void 0);

const $$Hero = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="border-b border-border py-8 sm:py-12"> <div class="max-w-3xl"> <p class="mb-3 text-label font-mono uppercase text-primary">● Stock 2026 — Envío en 24h</p> <h1 class="mb-4 text-display font-extrabold sm:mb-6">Hardware para<br><span class="text-primary">sistemas embebidos</span></h1> <p class="max-w-xl text-sm leading-relaxed text-muted sm:text-base">Microcontroladores, SBC, sensores y herramientas de laboratorio. Todo lo que necesitas para prototipar, medir y desplegar.</p> </div> </section>`;
}, "/home/orange/Projects/PW2/PWA/front/src/components/Hero.astro", void 0);

const FALLBACK_USD_RATE = 0.058;
const CACHE_KEY = "embedia-usd-rate-v2";
const PREF_KEY = "embedia-currency";
const CACHE_TTL_MS = 60 * 60 * 1e3;
const currency = signal("MXN");
const usdRateRaw = signal(null);
const usdLoading = signal(false);
const usdRate = computed(() => usdRateRaw.value ?? FALLBACK_USD_RATE);
const usdRateIsFallback = computed(() => usdRateRaw.value === null);
function readCurrencyPref() {
  if (typeof window === "undefined") return "MXN";
  try {
    return localStorage.getItem(PREF_KEY) === "USD" ? "USD" : "MXN";
  } catch {
    return "MXN";
  }
}
function persistCurrency(c) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREF_KEY, c);
  } catch {
  }
}
function readCachedRate() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const rate = Number(parsed?.rate);
    if (Number.isFinite(rate) && rate > 1e-3 && rate < 1) return rate;
    return null;
  } catch {
    return null;
  }
}
function cacheIsFresh() {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return typeof parsed?.ts === "number" && Date.now() - parsed.ts < CACHE_TTL_MS;
  } catch {
    return false;
  }
}
function persistRate(rate) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      rate,
      ts: Date.now()
    }));
  } catch {
  }
}
const ENDPOINTS = ["https://api.frankfurter.app/latest?from=MXN&to=USD", "https://api.frankfurter.dev/v1/latest?base=MXN&symbols=USD"];
async function fetchRate() {
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(6e3)
      });
      if (!res.ok) continue;
      const data = await res.json();
      const raw = data?.rates?.USD ?? data?.USD;
      const rate = Number(raw);
      if (Number.isFinite(rate) && rate > 1e-3 && rate < 1) return rate;
    } catch {
    }
  }
  return null;
}
async function ensureUsdRate(force = false) {
  if (typeof window === "undefined") return;
  if (usdLoading.value) return;
  if (!force && usdRateRaw.value !== null && cacheIsFresh()) return;
  usdLoading.value = true;
  try {
    const rate = await fetchRate();
    if (rate !== null) {
      usdRateRaw.value = rate;
      persistRate(rate);
    }
  } finally {
    usdLoading.value = false;
  }
}
function initCurrency() {
  if (typeof window === "undefined") return;
  const saved = readCurrencyPref();
  if (currency.value !== saved) currency.value = saved;
  if (usdRateRaw.value === null) {
    const cached = readCachedRate();
    if (cached !== null) usdRateRaw.value = cached;
  }
  void ensureUsdRate();
}
function setCurrency(c) {
  currency.value = c;
  persistCurrency(c);
  if (c === "USD") void ensureUsdRate();
}

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return String(iso);
  }
}
function formatMoney(n, code) {
  const amount = Number(n ?? 0).toFixed(2);
  return code === "USD" ? `US${amount}` : `${amount}`;
}
function formatPrecioMXN(n) {
  return formatMoney(n, "MXN");
}
const formatPrecio = formatPrecioMXN;
function formatPrecioDisplay(mxn) {
  const n = Number(mxn ?? 0);
  if (currency.value === "USD") {
    const usd = n * usdRate.value;
    const text2 = formatMoney(usd, "USD");
    return {
      text: text2,
      code: "USD",
      full: `${text2} USD`
    };
  }
  const text = formatMoney(n, "MXN");
  return {
    text,
    code: "MXN",
    full: `${text} MXN`
  };
}
function statusVariant(status) {
  const s = String(status).toUpperCase();
  if (s === "PENDIENTE") return "outline";
  if (s === "PAGADO" || s === "COMPLETADO" || s === "ENVIADO") return "success";
  if (s === "CANCELADO") return "destructive";
  return "default";
}
function formatTarjetaLabel(_pm, last4, installments) {
  const partes = [];
  if (last4) partes.push(`•••• ${last4}`);
  else partes.push("Tarjeta");
  if (installments && installments > 1) partes.push(`${installments} cuotas`);
  return partes.join(" · ");
}
function metodoPagoLabel(metodo) {
  const m = String(metodo ?? "").toLowerCase();
  if (m === "oxxo") return "OXXO (efectivo)";
  if (m === "tarjeta") return "Tarjeta";
  return metodo ? String(metodo) : "—";
}

function CartSummary() {
  const total = formatPrecioDisplay(cartTotal.value);
  return jsxs("div", {
    class: "space-y-3 font-mono text-sm",
    children: [jsxs("div", {
      class: "flex justify-between",
      children: [jsx("span", {
        class: "text-muted",
        children: "Productos"
      }), jsx("span", {
        class: "text-primary",
        children: String(cartCount.value).padStart(2, "0")
      })]
    }), jsxs("div", {
      class: "flex items-baseline justify-between border-t border-border pt-3",
      children: [jsx("span", {
        class: "text-muted",
        children: "Total"
      }), jsxs("span", {
        class: "flex items-baseline gap-1",
        children: [jsx("span", {
          class: "font-semibold text-primary",
          children: total.text
        }), jsx("span", {
          class: "text-[9px] uppercase text-muted",
          children: total.code
        })]
      })]
    })]
  });
}

const CETI_LAT = 20.70225;
const CETI_LNG = -103.38843;
const CETI_NOMBRE = "CETI Colomos";
const CETI_DIRECCION = "Calle Nueva Escocia 1885, Providencia 5ta Sección, Guadalajara, Jalisco";
const CETI_OSM_URL = `https://www.openstreetmap.org/?mlat=${CETI_LAT}&mlon=${CETI_LNG}#map=18/${CETI_LAT}/${CETI_LNG}`;

let leafletPromise = null;
function loadLeaflet() {
  if (!leafletPromise) {
    leafletPromise = Promise.all([import('leaflet'), Promise.resolve({                    })]).then(([mod]) => mod.default);
  }
  return leafletPromise;
}
function CETIMap({
  height = 200,
  address = null,
  interactive = false
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await loadLeaflet();
      if (cancelled || !containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.map(containerRef.current, {
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        attributionControl: true
      });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19
      }).addTo(map);
      const cetiIcon = L.divIcon({
        className: "ceti-marker",
        html: '<div class="ceti-marker-dot"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      L.marker([CETI_LAT, CETI_LNG], {
        icon: cetiIcon
      }).bindPopup(`<strong>${CETI_NOMBRE}</strong><br/>Origen de envío`).addTo(map);
      if (address) {
        const userIcon = L.divIcon({
          className: "user-marker",
          html: '<div class="user-marker-dot"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        L.marker([address.lat, address.lng], {
          icon: userIcon
        }).bindPopup(address.text ?? "Destino").addTo(map);
        map.fitBounds([[CETI_LAT, CETI_LNG], [address.lat, address.lng]], {
          padding: [24, 24],
          maxZoom: 15
        });
      } else {
        map.setView([CETI_LAT, CETI_LNG], 15);
      }
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [address?.lat, address?.lng, interactive]);
  return jsx("div", {
    ref: containerRef,
    class: "leaflet-dark w-full overflow-hidden rounded-sm border border-border bg-elevated",
    style: {
      height: `${height}px`
    },
    "aria-label": `Mapa: ${CETI_NOMBRE}`
  });
}

const $$ContextPanel = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<aside class="hidden min-w-0 h-fit xl:sticky xl:top-20 xl:block xl:border-l xl:border-border xl:pl-6"> <p class="mb-4 text-label font-medium uppercase text-muted">Tu pedido</p> ${renderComponent($$result, "CartSummary", CartSummary, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/CartSummary.tsx", "client:component-export": "default" })} <ul class="mt-6 space-y-2 border-t border-border pt-4 text-xs text-muted"> <li class="flex justify-between"><span>Envío</span><span class="text-foreground">Gratis +$100</span></li> <li class="flex justify-between"><span>Garantía</span><span class="text-foreground">12 meses</span></li> <li class="flex justify-between"><span>Pago</span><span class="text-foreground">Tarjeta · OXXO</span></li> </ul> <div class="mt-6 border-t border-border pt-4"> <p class="mb-2 text-label font-medium uppercase text-muted">Recoger en taller</p> ${renderComponent($$result, "CETIMap", CETIMap, { "client:visible": true, "height": 140, "client:component-hydration": "visible", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/CETIMap.tsx", "client:component-export": "default" })} <p class="mt-2 text-[11px] leading-snug text-muted">${CETI_NOMBRE}</p> <p class="text-[11px] leading-snug text-muted">${CETI_DIRECCION}</p> <a${addAttribute(CETI_OSM_URL, "href")} target="_blank" rel="noopener noreferrer" class="mt-2 inline-block font-mono text-[10px] uppercase tracking-wider text-primary underline underline-offset-2 hover:text-primary-soft">Ver en OpenStreetMap →</a> </div> </aside>`;
}, "/home/orange/Projects/PW2/PWA/front/src/components/ContextPanel.astro", void 0);

const badgeVariants = cva("inline-flex items-center rounded-sm px-1.5 py-0.5 text-label font-medium uppercase", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      outline: "border border-border text-muted",
      solid: "bg-elevated text-foreground",
      muted: "bg-surface text-muted",
      destructive: "border border-destructive/40 text-destructive",
      success: "border border-success/40 text-success"
    }
  },
  defaultVariants: {
    variant: "outline"
  }
});
function Badge({
  class: className,
  variant,
  ...props
}) {
  return jsx("span", {
    class: cn(badgeVariants({
      variant
    }), className),
    ...props
  });
}

function Skeleton({
  class: className,
  ...props
}) {
  return jsx("div", {
    class: cn("animate-pulse-soft rounded-sm bg-elevated", className),
    ...props
  });
}

function CurrencySelector() {
  const current = currency.value;
  return jsx("div", {
    role: "radiogroup",
    "aria-label": "Divisa del catálogo",
    class: "inline-flex items-center overflow-hidden rounded-sm border border-border bg-background font-mono text-[10px] uppercase tracking-wider",
    title: usdRateIsFallback.value ? "Tasa aproximada (API no disponible)" : `1 MXN = ${usdRate.value.toFixed(4)} USD`,
    children: ["MXN", "USD"].map((c) => {
      const active = current === c;
      const disabled = c === "USD" && usdLoading.value && current !== "USD";
      return jsxs("button", {
        type: "button",
        role: "radio",
        "aria-checked": active,
        onClick: () => setCurrency(c),
        disabled,
        class: cn("px-3 py-1.5 transition-colors disabled:cursor-wait", active ? "bg-primary text-primary-foreground" : "text-muted hover:bg-elevated hover:text-foreground"),
        children: [c, c === "USD" && usdRateIsFallback.value && active && jsx("span", {
          class: "ml-1 text-[9px]",
          children: "≈"
        })]
      }, c);
    })
  });
}

const PAGE_SIZE = 12;
let ssrConsumed = false;
function HomeView({
  initialProductos
} = {}) {
  const initial = initialProductos ?? [];
  const bootstrap = !ssrConsumed && initial.length > 0;
  const [productos, setProductos] = useState(bootstrap ? initial : []);
  const [offset, setOffset] = useState(bootstrap ? initial.length : 0);
  const [cargando, setCargando] = useState(!bootstrap);
  const [error, setError] = useState(null);
  const [hayMas, setHayMas] = useState(bootstrap ? initial.length >= PAGE_SIZE : true);
  const centinelaRef = useRef(null);
  const cargarPagina = async (nuevoOffset) => {
    setCargando(true);
    setError(null);
    try {
      const data = await gql(`query P($limit: Int!, $offset: Int!) { productos(limit: $limit, offset: $offset) { id nombre precio imagen stock categoria { id nombre } } }`, {
        limit: PAGE_SIZE,
        offset: nuevoOffset
      });
      const nuevos = Array.isArray(data?.productos) ? data.productos : [];
      setProductos((prev) => nuevoOffset === 0 ? nuevos : [...prev, ...nuevos]);
      setOffset(nuevoOffset + nuevos.length);
      if (nuevos.length < PAGE_SIZE) setHayMas(false);
    } catch (e) {
      setError(String(e?.message ?? "Error al cargar"));
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    if (bootstrap) {
      ssrConsumed = true;
      return;
    }
    setProductos([]);
    setOffset(0);
    setHayMas(true);
    cargarPagina(0);
  }, [catalogVersion.value]);
  useEffect(() => {
    const el = centinelaRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      if (cargando || !hayMas) return;
      cargarPagina(offset);
    }, {
      rootMargin: "400px 0px"
    });
    io.observe(el);
    return () => io.disconnect();
  }, [offset, cargando, hayMas]);
  return jsxs("section", {
    class: "pt-8",
    children: [jsxs("div", {
      class: "mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4",
      children: [jsx("h2", {
        class: "text-heading font-bold",
        children: "Catálogo"
      }), jsxs("div", {
        class: "flex items-center gap-3",
        children: [jsx(CurrencySelector, {}), jsx("span", {
          class: "font-mono text-xs text-muted",
          children: cargando && productos.length === 0 ? "Cargando…" : `${String(productos.length).padStart(2, "0")} productos`
        })]
      })]
    }), productos.length === 0 && cargando && jsx("div", {
      class: "grid grid-cols-2 gap-px bg-border md:grid-cols-3 lg:grid-cols-4",
      children: Array.from({
        length: 8
      }).map((_, i) => jsxs("div", {
        class: "space-y-3 bg-background p-4",
        children: [jsx(Skeleton, {
          class: "aspect-square w-full"
        }), jsx(Skeleton, {
          class: "h-3 w-3/4"
        }), jsx(Skeleton, {
          class: "h-4 w-1/3"
        })]
      }, i))
    }), error && productos.length === 0 && jsxs("div", {
      class: "border border-destructive/40 bg-destructive/5 p-4 text-sm",
      children: [jsx("p", {
        class: "mb-2 font-mono text-xs text-destructive",
        children: "ERROR"
      }), jsx("p", {
        class: "mb-3 text-muted",
        children: error
      }), jsx(Button, {
        variant: "outline",
        size: "sm",
        onClick: () => cargarPagina(0),
        children: "Reintentar"
      })]
    }), productos.length > 0 && jsx("div", {
      class: "grid grid-cols-2 gap-px bg-border md:grid-cols-3 lg:grid-cols-4",
      children: productos.map((p, idx) => {
        const first = idx === 0;
        const srcSet = productImageSrcSet(String(p.imagen ?? ""));
        const price = formatPrecioDisplay(p.precio);
        return jsxs("article", {
          onClick: () => abrirProductoModal(p),
          class: "group flex cursor-pointer flex-col bg-background p-4 transition-colors hover:bg-surface",
          children: [jsxs("div", {
            class: "relative mb-4 aspect-square overflow-hidden bg-elevated",
            children: [jsx("img", {
              src: imgUrl(p.imagen),
              srcset: srcSet,
              sizes: "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
              alt: String(p.nombre),
              width: 600,
              height: 600,
              class: "h-full w-full object-cover",
              loading: first ? "eager" : "lazy",
              fetchpriority: first ? "high" : "auto",
              decoding: "async"
            }), p.stock === 0 && jsx("div", {
              class: "absolute inset-0 grid place-items-center bg-background/90",
              children: jsx(Badge, {
                variant: "destructive",
                children: "Sin stock"
              })
            })]
          }), jsxs("div", {
            class: "flex flex-1 flex-col",
            children: [p.categoria && jsx("p", {
              class: "mb-2 font-mono text-[10px] uppercase tracking-wider text-muted",
              children: String(p.categoria.nombre)
            }), jsx("h3", {
              class: "mb-3 line-clamp-2 text-sm font-medium leading-snug",
              children: String(p.nombre)
            }), jsxs("div", {
              class: "mt-auto flex items-end justify-between border-t border-border pt-3",
              children: [jsxs("span", {
                class: "flex items-baseline gap-1",
                children: [jsx("span", {
                  class: "font-mono text-base font-bold text-primary",
                  children: price.text
                }), jsx("span", {
                  class: "font-mono text-[9px] uppercase text-muted",
                  children: price.code
                })]
              }), jsx("span", {
                class: "font-mono text-[10px] text-muted",
                children: p.stock === 0 ? "—" : `×${String(p.stock).padStart(2, "0")}`
              })]
            })]
          })]
        }, p.id);
      })
    }), jsx("div", {
      ref: centinelaRef,
      class: "h-px w-full"
    }), cargando && productos.length > 0 && jsxs("div", {
      class: "flex items-center justify-center gap-3 py-8 font-mono text-xs uppercase tracking-wider text-muted",
      children: [jsx("span", {
        class: "h-3 w-3 animate-spin rounded-full border border-border border-t-primary"
      }), "Cargando más…"]
    }), !hayMas && productos.length > 0 && jsxs("div", {
      class: "py-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted",
      children: ["— Fin del catálogo — (", productos.length, " productos)"]
    })]
  });
}

const CategoriaView = lazy(() => import('./CategoriaView_ZJF_mGQ_.mjs'));
const CarritoView = lazy(() => import('./CarritoView_DzZC4QNv.mjs'));
const CheckoutView = lazy(() => import('./CheckoutView_BJ3tY8ia.mjs'));
const PedidosView = lazy(() => import('./PedidosView_CmfuLGlX.mjs'));
const ProductModal = lazy(() => import('./ProductModal_2HZuS46k.mjs'));
const Fallback = () => jsxs("div", {
  class: "flex items-center justify-center gap-3 py-16 font-mono text-xs uppercase tracking-wider text-muted",
  children: [jsx("span", {
    class: "h-3 w-3 animate-spin rounded-full border border-border border-t-primary"
  }), "Cargando…"]
});
function ShopApp({
  initialProductos
} = {}) {
  const v = view.value;
  useEffect$1(() => {
    bootstrapAuth();
    initCurrency();
  }, []);
  useEffect$1(() => {
    const wrap = document.getElementById("hero-wrap");
    if (wrap) wrap.hidden = v !== "home";
  }, [v]);
  return jsxs(Fragment, {
    children: [v === "home" && jsx(HomeView, {
      initialProductos
    }), v !== "home" && jsxs(Suspense, {
      fallback: jsx(Fallback, {}),
      children: [v === "categoria" && jsx(CategoriaView, {}), v === "carrito" && jsx(CarritoView, {}), v === "checkout" && jsx(CheckoutView, {}), v === "pedidos" && jsx(PedidosView, {})]
    }), jsx(Suspense, {
      fallback: null,
      children: jsx(ProductModal, {})
    })]
  });
}

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const BACKEND = "http://localhost:4000";
  let initialProductos = [];
  try {
    const res = await fetch(`${BACKEND}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ productos(limit: 12, offset: 0) { id nombre precio imagen stock categoria { id nombre } } }" })
    });
    const json = await res.json();
    initialProductos = Array.isArray(json?.data?.productos) ? json.data.productos : [];
  } catch {
    initialProductos = [];
  }
  const publicBackend = String("").trim();
  const firstImage = initialProductos[0]?.imagen;
  const preloadImage = typeof firstImage === "string" && firstImage.length > 0 ? /^https?:\/\//.test(firstImage) ? firstImage : publicBackend ? `${publicBackend}${firstImage}` : firstImage : "";
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Embedia — Componentes y SBC para sistemas embebidos", "description": "Compra microcontroladores, SBC, sensores y herramientas de laboratorio. Envío en 24h y pago con tarjeta u OXXO.", "preloadImage": preloadImage }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "TopBar", $$TopBar, {})} ${maybeRenderHead()}<div class="mx-auto max-w-[1400px] px-4 sm:px-6"> <div class="grid grid-cols-1 gap-6 py-4 sm:py-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[200px_minmax(0,1fr)_240px]"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} <main id="main" class="min-w-0"> <div id="hero-wrap">${renderComponent($$result2, "Hero", $$Hero, {})}</div> ${renderComponent($$result2, "ShopApp", ShopApp, { "client:load": true, "initialProductos": initialProductos, "client:component-hydration": "load", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/ShopApp.tsx", "client:component-export": "default" })} </main> ${renderComponent($$result2, "ContextPanel", $$ContextPanel, {})} </div> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/orange/Projects/PW2/PWA/front/src/pages/index.astro", void 0);
const $$file = "/home/orange/Projects/PW2/PWA/front/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { Badge as B, CurrencySelector as C, Skeleton as S, formatPrecioMXN as a, CETIMap as b, currency as c, formatTarjetaLabel as d, formatFecha as e, formatPrecioDisplay as f, formatPrecio as g, metodoPagoLabel as m, page as p, statusVariant as s };
