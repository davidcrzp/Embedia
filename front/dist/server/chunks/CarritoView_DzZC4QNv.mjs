import { u as updateCartQuantity, m as cartItems, f as cartCount, d as cartTotal, B as Button, i as irAHome, h as imgUrl, r as removeFromCart, n as irAlCheckout } from './Footer_BKSbCEz3.mjs';
import { f as formatPrecioDisplay, C as CurrencySelector } from './index_B7izgKdV.mjs';
import { I as Input } from './input_CIh5QF4k.mjs';
import { jsxs, jsx } from 'preact/jsx-runtime';

function QuantityControl({
  item
}) {
  const max = Math.max(1, Math.floor(Number(item.producto.stock) || 1));
  const atMin = item.cantidad <= 1;
  const atMax = item.cantidad >= max;
  const setQty = (n) => updateCartQuantity(item.producto.id, n);
  const handleInput = (e) => {
    const input = e.target;
    const raw = input.value;
    if (raw === "") return;
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      input.value = String(item.cantidad);
      return;
    }
    let next = Math.floor(num);
    if (next < 1) next = 1;
    if (next > max) next = max;
    if (String(next) !== raw) input.value = String(next);
    setQty(next);
  };
  return jsxs("div", {
    class: "flex flex-col items-end gap-1",
    children: [jsxs("div", {
      class: "flex items-center gap-1",
      children: [jsx("button", {
        type: "button",
        onClick: () => setQty(item.cantidad - 1),
        disabled: atMin,
        "aria-label": "Disminuir cantidad",
        class: "grid h-8 w-8 place-items-center rounded-sm border border-border font-mono text-sm text-foreground transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30",
        children: "−"
      }), jsx(Input, {
        type: "number",
        min: 1,
        max,
        step: 1,
        value: item.cantidad,
        onInput: handleInput,
        "aria-label": "Cantidad",
        class: "h-8 w-14 rounded-sm px-1 text-center font-mono"
      }), jsx("button", {
        type: "button",
        onClick: () => setQty(item.cantidad + 1),
        disabled: atMax,
        "aria-label": "Aumentar cantidad",
        class: "grid h-8 w-8 place-items-center rounded-sm border border-border font-mono text-sm text-foreground transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30",
        children: "+"
      })]
    }), atMax && jsxs("span", {
      class: "font-mono text-[10px] uppercase tracking-wider text-muted",
      children: ["Máx. ", max, " uds."]
    })]
  });
}

function CarritoView() {
  const items = cartItems.value;
  const count = cartCount.value;
  const total = cartTotal.value;
  if (items.length === 0) {
    return jsxs("section", {
      class: "pt-8",
      children: [jsx("div", {
        class: "mb-6 border-b border-border pb-4",
        children: jsx("h2", {
          class: "text-heading font-bold",
          children: "Carrito"
        })
      }), jsxs("div", {
        class: "border border-border py-16 text-center",
        children: [jsx("p", {
          class: "mb-2 font-mono text-xs uppercase tracking-wider text-muted",
          children: "Vacío"
        }), jsx("p", {
          class: "mb-6 text-sm text-muted",
          children: "Aún no has agregado productos."
        }), jsx(Button, {
          onClick: irAHome,
          children: "Ir al catálogo"
        })]
      })]
    });
  }
  const totalDisplay = formatPrecioDisplay(total);
  return jsxs("section", {
    class: "pt-8",
    children: [jsxs("div", {
      class: "mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4",
      children: [jsx("h2", {
        class: "text-heading font-bold",
        children: "Carrito"
      }), jsxs("div", {
        class: "flex items-center gap-3",
        children: [jsx(CurrencySelector, {}), jsxs("span", {
          class: "font-mono text-xs text-muted",
          children: [String(items.length).padStart(2, "0"), " ", items.length === 1 ? "producto" : "productos", " · ", jsx("span", {
            class: "text-primary",
            children: String(count).padStart(2, "0")
          }), " unidades"]
        })]
      })]
    }), jsx("div", {
      class: "divide-y divide-border border-y border-border",
      children: items.map((i) => {
        const lineTotal = formatPrecioDisplay(Number(i.producto.precio) * i.cantidad);
        const unitPrice = formatPrecioDisplay(i.producto.precio);
        return jsxs("div", {
          class: "flex flex-wrap items-center gap-4 py-4 sm:gap-6",
          children: [jsx("div", {
            class: "h-16 w-16 flex-shrink-0 overflow-hidden border border-border bg-elevated",
            children: jsx("img", {
              src: imgUrl(i.producto.imagen),
              alt: String(i.producto.nombre),
              width: 64,
              height: 64,
              class: "h-full w-full object-cover",
              loading: "lazy",
              decoding: "async"
            })
          }), jsxs("div", {
            class: "min-w-0 flex-1",
            children: [jsx("p", {
              class: "truncate text-sm font-medium",
              children: String(i.producto.nombre)
            }), jsxs("p", {
              class: "mt-1 font-mono text-xs text-muted",
              children: [unitPrice.full, " · ", i.producto.stock, " disp."]
            })]
          }), jsx(QuantityControl, {
            item: i
          }), jsxs("span", {
            class: "w-28 text-right font-mono text-base font-semibold text-primary",
            children: [lineTotal.text, " ", jsx("span", {
              class: "text-[9px] uppercase text-muted",
              children: lineTotal.code
            })]
          }), jsx("button", {
            onClick: () => removeFromCart(i.producto.id),
            "aria-label": `Quitar ${i.producto.nombre}`,
            class: "font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-destructive",
            children: "Quitar"
          })]
        }, i.producto.id);
      })
    }), jsxs("div", {
      class: "mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4",
      children: [jsxs("div", {
        children: [jsx("p", {
          class: "mb-1 font-mono text-label uppercase text-muted",
          children: "Total"
        }), jsxs("p", {
          class: "flex items-baseline gap-2",
          children: [jsx("span", {
            class: "font-mono text-3xl font-bold text-primary",
            children: totalDisplay.text
          }), jsx("span", {
            class: "font-mono text-xs uppercase text-muted",
            children: totalDisplay.code
          })]
        }), jsx("p", {
          class: "mt-1 font-mono text-[10px] uppercase tracking-wider text-muted",
          children: "El cobro se realizará en MXN al finalizar"
        })]
      }), jsxs("div", {
        class: "flex gap-2",
        children: [jsx(Button, {
          variant: "outline",
          onClick: irAHome,
          class: "font-mono text-xs uppercase tracking-wider",
          children: "Seguir"
        }), jsx(Button, {
          onClick: irAlCheckout,
          class: "font-mono text-xs uppercase tracking-wider",
          children: "Checkout →"
        })]
      })]
    })]
  });
}

export { CarritoView as default };
