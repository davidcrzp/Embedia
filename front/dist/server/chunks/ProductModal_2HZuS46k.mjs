import { useRef, useEffect, useState } from 'preact/hooks';
import { w as productoModal, m as cartItems, h as imgUrl, B as Button, x as addToCart, q as irAlCarrito } from './Footer_BKSbCEz3.mjs';
import { f as formatPrecioDisplay } from './index_B7izgKdV.mjs';
import { jsx, jsxs } from 'preact/jsx-runtime';
import { I as Input } from './input_CIh5QF4k.mjs';

function Dialog({
  open,
  onClose,
  children
}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return jsx("dialog", {
    ref,
    onClose,
    onClick: (e) => {
      if (e.target === ref.current) onClose();
    },
    class: "fixed inset-0 m-auto w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100vh-2rem)] overflow-hidden rounded-sm border border-border-strong bg-surface text-foreground p-0 backdrop:bg-black/80",
    children: jsx("div", {
      class: "max-h-[calc(100vh-2rem)] overflow-y-auto p-6",
      children
    })
  });
}

function ProductModal() {
  const p = productoModal.value;
  const [cantidad, setCantidad] = useState(1);
  const enCarrito = p ? cartItems.value.find((i) => i.producto.id === p.id)?.cantidad ?? 0 : 0;
  const disponible = p ? Math.max(0, p.stock) : 0;
  const agotado = disponible === 0;
  const max = Math.max(1, disponible);
  useEffect(() => {
    setCantidad(1);
  }, [p?.id]);
  useEffect(() => {
    if (disponible > 0 && cantidad > disponible) setCantidad(disponible);
  }, [disponible]);
  if (!p) return null;
  const cerrar = () => {
    productoModal.value = null;
  };
  const agregar = () => {
    if (agotado) return;
    const copia = {
      ...p,
      categoria: p.categoria ? {
        ...p.categoria
      } : void 0
    };
    addToCart(copia, Math.min(Math.max(1, cantidad), max));
    cerrar();
    irAlCarrito();
  };
  const handleCantidadInput = (e) => {
    const input = e.target;
    const raw = input.value;
    if (raw === "") return;
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      input.value = String(cantidad);
      return;
    }
    let next = Math.floor(num);
    if (next < 1) next = 1;
    if (next > max) next = max;
    if (String(next) !== raw) input.value = String(next);
    setCantidad(next);
  };
  const price = formatPrecioDisplay(p.precio);
  const subtotal = formatPrecioDisplay(Number(p.precio) * Math.min(Math.max(1, cantidad), max));
  return jsxs(Dialog, {
    open: !!p,
    onClose: cerrar,
    children: [jsxs("div", {
      class: "mb-5 flex items-start justify-between gap-4",
      children: [jsxs("div", {
        children: [jsxs("p", {
          class: "mb-1 text-label font-mono uppercase text-muted",
          children: ["SKU-", String(p.id).padStart(5, "0")]
        }), jsx("h2", {
          class: "text-heading font-bold leading-tight",
          children: String(p.nombre)
        })]
      }), jsx("button", {
        onClick: cerrar,
        "aria-label": "Cerrar",
        class: "font-mono text-muted transition-colors hover:text-foreground",
        children: "[esc]"
      })]
    }), jsx("div", {
      class: "mb-5 overflow-hidden rounded-sm border border-border bg-elevated",
      children: jsx("img", {
        src: imgUrl(p.imagen),
        alt: String(p.nombre),
        width: 600,
        height: 224,
        class: "h-56 w-full object-cover",
        loading: "lazy",
        decoding: "async"
      })
    }), jsxs("div", {
      class: "mb-5 flex items-end justify-between border-y border-border py-4",
      children: [jsxs("div", {
        children: [jsx("p", {
          class: "mb-1 text-label font-mono uppercase text-muted",
          children: "Precio"
        }), jsxs("p", {
          class: "flex items-baseline gap-2",
          children: [jsx("span", {
            class: "font-mono text-3xl font-bold text-primary",
            children: price.text
          }), jsx("span", {
            class: "font-mono text-xs uppercase text-muted",
            children: price.code
          })]
        })]
      }), jsxs("div", {
        class: "text-right",
        children: [jsx("p", {
          class: "mb-1 text-label font-mono uppercase text-muted",
          children: "Stock"
        }), jsx("p", {
          class: `font-mono text-sm font-semibold ${agotado ? "text-destructive" : "text-foreground"}`,
          children: agotado ? "AGOTADO" : String(disponible).padStart(2, "0") + " uds."
        })]
      })]
    }), jsxs("div", {
      class: "mb-5 flex items-center gap-4",
      children: [jsxs("div", {
        children: [jsx("label", {
          for: "modal-cantidad",
          class: "mb-1 block text-label font-mono uppercase text-muted",
          children: "Cantidad"
        }), jsx(Input, {
          id: "modal-cantidad",
          type: "number",
          min: 1,
          max,
          step: 1,
          value: cantidad,
          disabled: agotado,
          class: "w-24 text-center font-mono",
          onInput: handleCantidadInput
        })]
      }), jsxs("div", {
        class: "flex-1 text-right",
        children: [jsx("p", {
          class: "mb-1 text-label font-mono uppercase text-muted",
          children: "Subtotal"
        }), jsxs("p", {
          class: "font-mono text-lg font-bold",
          children: [subtotal.text, " ", jsx("span", {
            class: "text-[10px] uppercase text-muted",
            children: subtotal.code
          })]
        })]
      })]
    }), enCarrito > 0 && jsxs("p", {
      class: "mb-3 font-mono text-[10px] uppercase tracking-wider text-muted",
      children: ["Ya tienes ", enCarrito, " en el carrito"]
    }), jsxs("div", {
      class: "flex gap-2",
      children: [jsx(Button, {
        variant: "outline",
        onClick: cerrar,
        class: "flex-1 font-mono text-xs uppercase tracking-wider",
        children: "Cancelar"
      }), jsx(Button, {
        onClick: agregar,
        disabled: agotado,
        class: "flex-1 font-mono text-xs uppercase tracking-wider",
        children: agotado ? "Sin stock" : "Añadir"
      })]
    })]
  });
}

export { ProductModal as default };
