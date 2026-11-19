import { useState, useEffect } from 'preact/hooks';
import { o as currentUser, B as Button, i as irAHome, h as imgUrl, k as gql, A as ApiError } from './Footer_BKSbCEz3.mjs';
import { S as Skeleton, d as formatTarjetaLabel, e as formatFecha, g as formatPrecio, m as metodoPagoLabel, B as Badge, s as statusVariant, b as CETIMap } from './index_B7izgKdV.mjs';
import { jsxs, jsx } from 'preact/jsx-runtime';

function copiar(texto) {
  if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(texto).catch(() => {
  });
}
function PedidosView() {
  const usuario = currentUser.value;
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await gql(`query { misPedidos { id fecha total status metodoPago mpOrderId mpPaymentId mpPaymentMethod mpLast4 mpInstallments mpTicketUrl mpBarcode mpReference mpExpiresAt direccion lat lng detalles { id cantidad precio producto { id nombre imagen } } } }`);
      setPedidos(Array.isArray(data?.misPedidos) ? data.misPedidos : []);
    } catch (e) {
      if (e instanceof ApiError) {
        const g = e.errors[0];
        if (g?.extensions?.code === "UNAUTHENTICATED") setPedidos([]);
        else setError(String(g?.message ?? "Error al cargar pedidos"));
      } else setError(String(e?.message ?? "Error al cargar pedidos"));
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    if (!usuario) {
      setPedidos([]);
      setError(null);
      setCargando(false);
      return;
    }
    cargar();
  }, [usuario?.id]);
  if (cargando) return jsxs("section", {
    class: "pt-8",
    children: [jsxs("div", {
      class: "mb-6 flex items-end justify-between border-b border-border pb-4",
      children: [jsx("h2", {
        class: "text-heading font-bold",
        children: "Mis pedidos"
      }), jsx("span", {
        class: "font-mono text-xs text-muted",
        children: "Cargando…"
      })]
    }), jsx("div", {
      class: "space-y-4",
      children: Array.from({
        length: 2
      }).map((_, i) => jsxs("div", {
        class: "border border-border p-6",
        children: [jsx(Skeleton, {
          class: "mb-3 h-3 w-1/4"
        }), jsx(Skeleton, {
          class: "mb-4 h-4 w-1/2"
        }), jsx(Skeleton, {
          class: "h-3 w-1/3"
        })]
      }, i))
    })]
  });
  if (error) return jsxs("section", {
    class: "pt-8",
    children: [jsx("div", {
      class: "mb-6 border-b border-border pb-4",
      children: jsx("h2", {
        class: "text-heading font-bold",
        children: "Mis pedidos"
      })
    }), jsxs("div", {
      class: "border border-destructive/40 bg-destructive/5 p-4 text-sm",
      children: [jsx("p", {
        class: "mb-2 font-mono text-xs uppercase text-destructive",
        children: "Error"
      }), jsx("p", {
        class: "mb-3 text-muted",
        children: error
      }), jsx(Button, {
        variant: "outline",
        size: "sm",
        onClick: cargar,
        children: "Reintentar"
      })]
    })]
  });
  if (pedidos.length === 0) return jsxs("section", {
    class: "pt-8",
    children: [jsxs("div", {
      class: "mb-6 flex items-end justify-between border-b border-border pb-4",
      children: [jsx("h2", {
        class: "text-heading font-bold",
        children: "Mis pedidos"
      }), jsx("span", {
        class: "font-mono text-xs text-muted",
        children: "00 pedidos"
      })]
    }), jsxs("div", {
      class: "border border-border py-16 text-center",
      children: [jsx("p", {
        class: "mb-2 font-mono text-xs uppercase tracking-wider text-muted",
        children: "Vacío"
      }), jsx("p", {
        class: "mb-6 text-sm text-muted",
        children: "Aún no has realizado ninguna compra."
      }), jsx(Button, {
        onClick: irAHome,
        children: "Ir al catálogo"
      })]
    })]
  });
  return jsxs("section", {
    class: "pt-8",
    children: [jsxs("div", {
      class: "mb-6 flex items-end justify-between border-b border-border pb-4",
      children: [jsx("h2", {
        class: "text-heading font-bold",
        children: "Mis pedidos"
      }), jsxs("span", {
        class: "font-mono text-xs text-muted",
        children: [String(pedidos.length).padStart(2, "0"), " pedidos"]
      })]
    }), jsx("div", {
      class: "space-y-6",
      children: pedidos.map((pedido) => {
        const esOxxo = String(pedido.metodoPago ?? "").toLowerCase() === "oxxo";
        const pendiente = String(pedido.status).toUpperCase() === "PENDIENTE";
        const mostrarTicket = esOxxo && pendiente && (pedido.mpBarcode || pedido.mpTicketUrl || pedido.mpReference);
        const tarjetaLabel = !esOxxo ? formatTarjetaLabel(pedido.mpPaymentMethod, pedido.mpLast4, pedido.mpInstallments) : "";
        const tieneTarjeta = !esOxxo && !!(pedido.mpPaymentMethod || pedido.mpLast4);
        const tieneDireccion = !!pedido.direccion || pedido.lat != null && pedido.lng != null;
        return jsxs("article", {
          class: "border border-border",
          children: [jsxs("header", {
            class: "flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface/40 p-4",
            children: [jsxs("div", {
              class: "flex flex-wrap items-center gap-6 font-mono text-xs",
              children: [jsxs("div", {
                children: [jsx("p", {
                  class: "mb-0.5 text-label uppercase text-muted",
                  children: "Pedido"
                }), jsxs("p", {
                  class: "text-sm font-semibold text-foreground",
                  children: ["#", String(pedido.id).padStart(5, "0")]
                })]
              }), jsxs("div", {
                children: [jsx("p", {
                  class: "mb-0.5 text-label uppercase text-muted",
                  children: "Fecha"
                }), jsx("p", {
                  class: "text-foreground",
                  children: formatFecha(pedido.fecha)
                })]
              }), jsxs("div", {
                children: [jsx("p", {
                  class: "mb-0.5 text-label uppercase text-muted",
                  children: "Total"
                }), jsxs("p", {
                  class: "text-sm font-semibold text-primary",
                  children: [formatPrecio(pedido.total), " MXN"]
                })]
              }), jsxs("div", {
                children: [jsx("p", {
                  class: "mb-0.5 text-label uppercase text-muted",
                  children: "Método"
                }), jsxs("p", {
                  class: "flex items-center gap-1.5 text-foreground",
                  children: [jsx("span", {
                    "aria-hidden": "true",
                    children: esOxxo ? "🏪" : "💳"
                  }), jsx("span", {
                    children: metodoPagoLabel(pedido.metodoPago)
                  })]
                })]
              }), tieneTarjeta && jsxs("div", {
                children: [jsx("p", {
                  class: "mb-0.5 text-label uppercase text-muted",
                  children: "Tarjeta"
                }), jsx("p", {
                  class: "flex items-center gap-1.5 text-foreground",
                  children: jsx("span", {
                    children: tarjetaLabel
                  })
                })]
              })]
            }), jsx(Badge, {
              variant: statusVariant(pedido.status),
              children: String(pedido.status)
            })]
          }), mostrarTicket && jsxs("div", {
            class: "border-b border-border bg-primary/5 p-4",
            children: [jsxs("div", {
              class: "mb-3 flex items-center justify-between gap-2",
              children: [jsx("p", {
                class: "font-mono text-label uppercase text-primary",
                children: "🏪 Ticket OXXO pendiente de pago"
              }), jsxs("span", {
                class: "font-mono text-[10px] uppercase tracking-wider text-muted",
                children: ["Vence: ", pedido.mpExpiresAt ? formatFecha(pedido.mpExpiresAt) : "—"]
              })]
            }), jsxs("div", {
              class: "grid grid-cols-1 gap-3 sm:grid-cols-2",
              children: [jsxs("div", {
                children: [jsx("p", {
                  class: "mb-1 text-label font-mono uppercase text-muted",
                  children: "Referencia"
                }), jsxs("div", {
                  class: "flex items-center gap-2",
                  children: [jsx("p", {
                    class: "font-mono text-sm font-semibold text-foreground",
                    children: pedido.mpReference ?? "—"
                  }), pedido.mpReference && jsx("button", {
                    type: "button",
                    onClick: () => copiar(String(pedido.mpReference)),
                    class: "font-mono text-[10px] uppercase tracking-wider text-muted hover:text-primary",
                    children: "Copiar"
                  })]
                })]
              }), jsxs("div", {
                children: [jsx("p", {
                  class: "mb-1 text-label font-mono uppercase text-muted",
                  children: "Código de barras"
                }), jsxs("div", {
                  class: "flex items-start gap-2",
                  children: [jsx("p", {
                    class: "break-all font-mono text-xs text-foreground",
                    children: pedido.mpBarcode ?? "—"
                  }), pedido.mpBarcode && jsx("button", {
                    type: "button",
                    onClick: () => copiar(String(pedido.mpBarcode)),
                    class: "shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-primary",
                    children: "Copiar"
                  })]
                })]
              }), jsxs("div", {
                children: [jsx("p", {
                  class: "mb-1 text-label font-mono uppercase text-muted",
                  children: "Monto a pagar"
                }), jsxs("p", {
                  class: "font-mono text-sm font-semibold text-primary",
                  children: [formatPrecio(pedido.total), " MXN"]
                })]
              }), jsxs("div", {
                children: [jsx("p", {
                  class: "mb-1 text-label font-mono uppercase text-muted",
                  children: "Estado"
                }), jsx("p", {
                  class: "font-mono text-sm text-foreground",
                  children: "Esperando pago en tienda"
                })]
              })]
            }), pedido.mpTicketUrl && jsx("div", {
              class: "mt-4 flex flex-wrap gap-2",
              children: jsx("a", {
                href: pedido.mpTicketUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                children: jsx(Button, {
                  variant: "outline",
                  size: "sm",
                  class: "font-mono text-xs uppercase tracking-wider",
                  children: "🖨 Ver / imprimir ticket"
                })
              })
            }), jsx("p", {
              class: "mt-3 text-[11px] leading-relaxed text-muted",
              children: "Acude a cualquier tienda OXXO con el número de referencia o código de barras y paga el monto exacto."
            })]
          }), jsx("ul", {
            class: "divide-y divide-border",
            children: pedido.detalles.map((d) => jsxs("li", {
              class: "flex items-center gap-4 p-4",
              children: [jsx("div", {
                class: "h-12 w-12 flex-shrink-0 overflow-hidden border border-border bg-elevated",
                children: jsx("img", {
                  src: imgUrl(d.producto.imagen),
                  alt: String(d.producto.nombre),
                  width: 48,
                  height: 48,
                  class: "h-full w-full object-cover",
                  loading: "lazy",
                  decoding: "async"
                })
              }), jsxs("div", {
                class: "min-w-0 flex-1",
                children: [jsx("p", {
                  class: "truncate text-sm font-medium",
                  children: String(d.producto.nombre)
                }), jsxs("p", {
                  class: "mt-0.5 font-mono text-xs text-muted",
                  children: [formatPrecio(d.precio), " × ", String(d.cantidad).padStart(2, "0")]
                })]
              }), jsx("span", {
                class: "font-mono text-sm font-semibold text-primary",
                children: formatPrecio(Number(d.precio) * d.cantidad)
              })]
            }, d.id))
          }), tieneDireccion && jsxs("div", {
            class: "border-t border-border p-4",
            children: [jsx("p", {
              class: "mb-2 text-label font-mono uppercase text-muted",
              children: "Envío"
            }), jsxs("div", {
              class: "grid grid-cols-1 gap-4 sm:grid-cols-[1fr_280px]",
              children: [jsxs("div", {
                class: "space-y-1",
                children: [pedido.direccion && jsx("p", {
                  class: "text-sm text-foreground",
                  children: pedido.direccion
                }), pedido.lat != null && pedido.lng != null && jsx("p", {
                  class: "font-mono text-[10px] uppercase tracking-wider text-muted",
                  children: "Ruta desde CETI Colomos"
                })]
              }), pedido.lat != null && pedido.lng != null && jsx(CETIMap, {
                height: 160,
                address: {
                  lat: Number(pedido.lat),
                  lng: Number(pedido.lng),
                  text: pedido.direccion ?? "Destino"
                }
              })]
            })]
          })]
        }, pedido.id);
      })
    }), jsx("div", {
      class: "mt-8 flex justify-start",
      children: jsx(Button, {
        variant: "outline",
        onClick: irAHome,
        class: "font-mono text-xs uppercase tracking-wider",
        children: "← Volver al catálogo"
      })
    })]
  });
}

export { PedidosView as default };
