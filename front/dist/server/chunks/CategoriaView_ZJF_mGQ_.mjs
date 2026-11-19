import { useState, useRef, useEffect } from 'preact/hooks';
import { c as categoriaSeleccionada, g as catalogVersion, i as irAHome, B as Button, p as productImageSrcSet, h as imgUrl, j as abrirProductoModal, k as gql } from './Footer_BKSbCEz3.mjs';
import { S as Skeleton, f as formatPrecioDisplay, B as Badge } from './index_B7izgKdV.mjs';
import { jsxs, jsx } from 'preact/jsx-runtime';

const PAGE_SIZE = 12;
function CategoriaView() {
  const cat = categoriaSeleccionada.value;
  const [productos, setProductos] = useState([]);
  const [offset, setOffset] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [hayMas, setHayMas] = useState(true);
  const centinelaRef = useRef(null);
  const cargarPagina = async (nuevoOffset) => {
    if (!cat) return;
    setCargando(true);
    setError(null);
    try {
      const data = await gql(`query Cat($id: ID!, $limit: Int!, $offset: Int!) { categoria(id: $id) { productos(limit: $limit, offset: $offset) { id nombre precio imagen stock } } }`, {
        id: cat.id,
        limit: PAGE_SIZE,
        offset: nuevoOffset
      });
      const nuevos = Array.isArray(data?.categoria?.productos) ? data.categoria.productos : [];
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
    setProductos([]);
    setOffset(0);
    setHayMas(true);
    cargarPagina(0);
  }, [cat?.id, catalogVersion.value]);
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
  if (!cat) return null;
  return jsxs("section", {
    class: "pt-8",
    children: [jsxs("div", {
      class: "mb-6 border-b border-border pb-4",
      children: [jsx("button", {
        onClick: irAHome,
        class: "mb-3 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-primary",
        children: "← Catálogo"
      }), jsxs("div", {
        class: "flex items-end justify-between",
        children: [jsx("h2", {
          class: "text-heading font-bold",
          children: String(cat.nombre)
        }), jsx("span", {
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
            children: [jsx("p", {
              class: "mb-2 font-mono text-[10px] uppercase tracking-wider text-muted",
              children: String(cat.nombre)
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
      children: ["— Fin de categoría — (", productos.length, " productos)"]
    })]
  });
}

export { CategoriaView as default };
