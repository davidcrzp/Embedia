import { a as createComponent, m as maybeRenderHead, d as renderComponent, r as renderTemplate, c as createAstro } from './astro/server_O3v_sucX.mjs';
import 'kleur/colors';
import { useState, useEffect, useRef } from 'preact/hooks';
import { signal, computed } from '@preact/signals';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsx, jsxs } from 'preact/jsx-runtime';

const STORAGE_KEY = "embedia-cart";
function load() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
const cartItems = signal(load());
function persist(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
  }
}
function copy(p) {
  return {
    ...p,
    categoria: p.categoria ? {
      ...p.categoria
    } : void 0
  };
}
function addToCart(p, cantidad) {
  const list = cartItems.value;
  const found = list.find((i) => i.producto.id === p.id);
  const next = found ? list.map((i) => i.producto.id === p.id ? {
    ...i,
    cantidad: Math.min(i.cantidad + cantidad, p.stock)
  } : i) : [...list, {
    producto: copy(p),
    cantidad: Math.min(cantidad, p.stock)
  }];
  cartItems.value = next;
  persist(next);
}
function removeFromCart(id) {
  const next = cartItems.value.filter((i) => i.producto.id !== id);
  cartItems.value = next;
  persist(next);
}
function updateCartQuantity(id, cantidad) {
  const next = cartItems.value.map((i) => {
    if (i.producto.id !== id) return i;
    const max = Math.max(1, Math.floor(Number(i.producto.stock) || 1));
    const n = Math.max(1, Math.min(Math.floor(cantidad), max));
    return {
      ...i,
      cantidad: n
    };
  });
  cartItems.value = next;
  persist(next);
}
function clearCart() {
  cartItems.value = [];
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  }
}
const cartCount = computed(() => cartItems.value.reduce((s, i) => s + i.cantidad, 0));
const cartTotal = computed(() => cartItems.value.reduce((s, i) => s + i.cantidad * i.producto.precio, 0));

const view = signal("home");
const categoriaSeleccionada = signal(null);
const productoModal = signal(null);
const catalogVersion = signal(0);
function bumpCatalogVersion() {
  catalogVersion.value += 1;
}
function irAHome() {
  view.value = "home";
  productoModal.value = null;
  categoriaSeleccionada.value = null;
}
function elegirCategoria(id, nombre) {
  categoriaSeleccionada.value = {
    id,
    nombre
  };
  view.value = "categoria";
  productoModal.value = null;
}
function irAlCarrito() {
  productoModal.value = null;
  view.value = "carrito";
}
function irAlCheckout() {
  productoModal.value = null;
  view.value = "checkout";
}
function irAMisPedidos() {
  productoModal.value = null;
  view.value = "pedidos";
}
function pedidoCreado() {
  view.value = "pedidos";
  categoriaSeleccionada.value = null;
  bumpCatalogVersion();
}
function abrirProductoModal(p) {
  productoModal.value = {
    ...p,
    categoria: p.categoria ? {
      ...p.categoria
    } : void 0
  };
}

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary-soft",
      outline: "border border-border bg-transparent hover:border-border-strong hover:bg-elevated",
      ghost: "hover:bg-elevated",
      subtle: "bg-elevated hover:bg-border",
      destructive: "bg-destructive text-white hover:bg-destructive/90"
    },
    size: {
      default: "h-9 px-4 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-11 px-6 text-sm",
      icon: "h-9 w-9"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
function Button({
  class: className,
  variant,
  size,
  ...props
}) {
  return jsx("button", {
    class: cn(buttonVariants({
      variant,
      size
    }), className),
    ...props
  });
}

function CartBadge() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const count = mounted ? cartCount.value : 0;
  return jsxs(Button, {
    variant: "outline",
    size: "sm",
    onClick: irAlCarrito,
    class: "gap-2 font-mono",
    "aria-label": `Carrito (${count} artículos)`,
    children: [jsx("span", {
      class: "hidden sm:inline",
      children: "Carrito"
    }), jsx("span", {
      class: "sm:hidden",
      "aria-hidden": "true",
      children: "🛒"
    }), jsx("span", {
      class: "text-primary",
      children: count
    })]
  });
}

function PedidosBadge() {
  return jsx(Button, {
    variant: "ghost",
    size: "sm",
    onClick: irAMisPedidos,
    class: "hidden font-mono text-xs uppercase tracking-wider md:inline-flex",
    children: "Mis pedidos"
  });
}

const RAW_BACKEND = String("https://embedia-production.up.railway.app/").trim().replace(/\/+$/, "");
function backendUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return RAW_BACKEND ? `${RAW_BACKEND}${p}` : p;
}
const API_URL = backendUrl(String("/graphql"));
(() => {
  const explicit = String("").trim();
  if (explicit) return explicit;
  if (RAW_BACKEND) return `${RAW_BACKEND}/graphql`;
  if (typeof location !== "undefined") return `${location.protocol}//${location.hostname}:4000/graphql`;
  return "/graphql";
})();

function imgUrl(path) {
  if (typeof path !== "string" || path.length === 0) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return backendUrl(path);
}
function productImageSrcSet(path, widths = [300, 600]) {
  if (typeof path !== "string" || !/images\.unsplash\.com/.test(path)) return void 0;
  return widths.map((w) => `${path.replace(/w=\d+/, `w=${w}`)} ${w}w`).join(", ");
}
class ApiError extends Error {
  errors;
  constructor(errors) {
    super(errors.map((e) => e.message).join(" | ") || "Error GraphQL");
    this.errors = errors;
  }
}
async function gql(query, variables) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      query,
      variables
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new ApiError(json.errors);
  return json.data;
}
async function authLogout() {
  await fetch(backendUrl("/auth/logout"), {
    method: "POST",
    credentials: "include"
  });
}
async function authMe() {
  const res = await fetch(backendUrl("/auth/me"), {
    credentials: "include",
    cache: "no-store"
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.usuario ?? null;
}

const currentUser = signal(null);
const authLoading = signal(true);
let bootstrapped = false;
async function bootstrapAuth() {
  if (bootstrapped) return;
  bootstrapped = true;
  try {
    currentUser.value = await authMe();
  } finally {
    authLoading.value = false;
  }
}
async function logout() {
  try {
    await authLogout();
  } finally {
    clearCart();
    currentUser.value = null;
    window.location.href = "/";
  }
}

function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  useEffect(() => {
    setMounted(true);
    bootstrapAuth();
  }, []);
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);
  if (!mounted) return jsx("div", {
    class: "h-9 w-24",
    "aria-hidden": "true"
  });
  if (authLoading.value) return jsx("span", {
    class: "font-mono text-xs text-muted",
    children: "—"
  });
  const u = currentUser.value;
  if (!u) return jsx("a", {
    href: "/login",
    children: jsx(Button, {
      variant: "ghost",
      size: "sm",
      class: "font-mono text-xs uppercase tracking-wider",
      children: "Iniciar sesión"
    })
  });
  const go = (fn) => () => {
    setOpen(false);
    fn();
  };
  return jsxs("div", {
    ref: wrapperRef,
    class: "relative",
    children: [jsxs("div", {
      class: "hidden items-center gap-3 md:flex",
      children: [u.rol === "ADMIN" && jsx("a", {
        href: "/admin",
        children: jsx(Button, {
          variant: "outline",
          size: "sm",
          class: "border-primary/40 font-mono text-xs uppercase tracking-wider text-primary hover:border-primary",
          children: "Admin"
        })
      }), jsxs("div", {
        class: "min-w-0 text-right",
        children: [jsx("p", {
          class: "truncate text-xs font-medium leading-tight",
          children: u.nombre
        }), jsx("p", {
          class: "truncate font-mono text-[10px] text-muted",
          children: u.email
        })]
      }), jsx(Button, {
        variant: "ghost",
        size: "sm",
        onClick: logout,
        class: "font-mono text-xs uppercase tracking-wider",
        children: "Salir"
      })]
    }), jsxs("button", {
      type: "button",
      onClick: () => setOpen((v) => !v),
      "aria-haspopup": "menu",
      "aria-expanded": open,
      class: "flex items-center gap-2 rounded-sm border border-border bg-transparent px-2 py-1 text-left transition-colors hover:border-border-strong hover:bg-elevated md:hidden",
      children: [jsxs("div", {
        class: "min-w-0 max-w-[130px]",
        children: [jsx("p", {
          class: "truncate text-xs font-medium leading-tight text-foreground",
          children: u.nombre
        }), jsx("p", {
          class: "truncate font-mono text-[10px] leading-tight text-muted",
          children: u.email
        })]
      }), jsx("span", {
        class: cn("shrink-0 text-muted transition-transform", open && "rotate-180"),
        "aria-hidden": "true",
        children: "▾"
      })]
    }), open && jsxs("div", {
      role: "menu",
      class: "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-sm border border-border-strong bg-surface shadow-xl md:hidden",
      children: [jsxs("div", {
        class: "border-b border-border px-4 py-3",
        children: [jsx("p", {
          class: "truncate text-sm font-medium text-foreground",
          children: u.nombre
        }), jsx("p", {
          class: "mt-0.5 truncate font-mono text-[10px] text-muted",
          children: u.email
        }), jsx("p", {
          class: "mt-1 font-mono text-[10px] uppercase tracking-wider text-primary",
          children: u.rol
        })]
      }), jsxs("ul", {
        class: "py-1",
        children: [jsx("li", {
          children: jsxs("button", {
            role: "menuitem",
            type: "button",
            onClick: go(() => {
              irAMisPedidos();
            }),
            class: "flex w-full items-center justify-between px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-elevated",
            children: [jsx("span", {
              children: "Mis pedidos"
            }), jsx("span", {
              class: "font-mono text-[10px] text-muted",
              "aria-hidden": "true",
              children: "→"
            })]
          })
        }), u.rol === "ADMIN" && jsx("li", {
          children: jsxs("a", {
            role: "menuitem",
            href: "/admin",
            onClick: () => setOpen(false),
            class: "flex w-full items-center justify-between px-4 py-2 text-left text-sm text-primary transition-colors hover:bg-elevated",
            children: [jsx("span", {
              children: "Admin dashboard"
            }), jsx("span", {
              class: "font-mono text-[10px]",
              "aria-hidden": "true",
              children: "→"
            })]
          })
        })]
      }), jsx("div", {
        class: "border-t border-border",
        children: jsxs("button", {
          role: "menuitem",
          type: "button",
          onClick: go(logout),
          class: "flex w-full items-center justify-between px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10",
          children: [jsx("span", {
            children: "Salir"
          }), jsx("span", {
            class: "font-mono text-[10px]",
            "aria-hidden": "true",
            children: "↪"
          })]
        })
      })]
    })]
  });
}

const $$TopBar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-40 border-b border-border bg-background"> <div class="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-3 sm:gap-4 sm:px-6"> <a href="/" class="flex items-center gap-2 sm:gap-3"> <span class="grid h-7 w-7 place-items-center rounded-sm bg-primary font-mono text-xs font-bold text-primary-foreground" aria-hidden="true">E</span> <div class="flex items-baseline gap-2"> <span class="text-sm font-bold uppercase tracking-[0.15em]">Embedia</span> <span class="hidden text-label font-mono uppercase text-muted md:inline">/ Embedded Systems</span> </div> </a> <div class="flex-1"></div> ${renderComponent($$result, "PedidosBadge", PedidosBadge, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/PedidosBadge.tsx", "client:component-export": "default" })} ${renderComponent($$result, "UserMenu", UserMenu, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/UserMenu.tsx", "client:component-export": "default" })} ${renderComponent($$result, "CartBadge", CartBadge, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/CartBadge.tsx", "client:component-export": "default" })} </div> </header>`;
}, "/home/orange/Projects/PW2/PWA/front/src/components/TopBar.astro", void 0);

const $$Astro = createAstro("https://embedia.netlify.app");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Footer;
  return renderTemplate`${maybeRenderHead()}<footer class="mt-16 border-t border-border py-8"> <div class="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 text-center text-xs text-muted sm:flex-row sm:px-6 sm:text-left"> <p class="font-mono">© 2026 EMBEDIA</p> <p class="font-mono uppercase tracking-wider">Astro · Preact · GraphQL · Mercado Pago Orders API</p> </div> </footer>`;
}, "/home/orange/Projects/PW2/PWA/front/src/components/Footer.astro", void 0);

export { $$TopBar as $, ApiError as A, Button as B, $$Footer as a, cn as b, categoriaSeleccionada as c, cartTotal as d, elegirCategoria as e, cartCount as f, catalogVersion as g, imgUrl as h, irAHome as i, abrirProductoModal as j, gql as k, bootstrapAuth as l, cartItems as m, irAlCheckout as n, currentUser as o, productImageSrcSet as p, irAlCarrito as q, removeFromCart as r, clearCart as s, pedidoCreado as t, updateCartQuantity as u, view as v, productoModal as w, addToCart as x };
