import { useRef, useState, useEffect } from 'preact/hooks';
import { B as Button, b as cn, m as cartItems, d as cartTotal, o as currentUser, q as irAlCarrito, k as gql, s as clearCart, t as pedidoCreado } from './Footer_CJBpYwEF.mjs';
import { a as formatPrecioMXN, b as CETIMap, c as currency } from './index_Dj9m4xvh.mjs';
import { jsxs, jsx } from 'preact/jsx-runtime';
import { I as Input } from './input_Cw01B35N.mjs';

const CONTENEDOR_ID = "cardPaymentBrick_container";
const READY_TIMEOUT_MS = 12e3;
let mpSdkPromise = null;
function loadMercadoPagoSDK() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  if (mpSdkPromise) return mpSdkPromise;
  mpSdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://sdk.mercadopago.com/js/v2";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar el SDK de Mercado Pago."));
    document.head.appendChild(s);
  });
  return mpSdkPromise;
}
function CardPaymentBrick({
  amount,
  items,
  payerEmail,
  address = null,
  onSuccess,
  onError,
  onClearError
}) {
  const controllerRef = useRef(null);
  const [estado, setEstado] = useState("cargando");
  const [errorInterno, setErrorInterno] = useState(null);
  useEffect(() => {
    let cancelled = false;
    let readyTimer = null;
    const marcarError = (msg) => {
      if (cancelled) return;
      setErrorInterno(msg);
      setEstado("error");
      onError(msg);
    };
    const limpiarTimer = () => {
      if (readyTimer) {
        clearTimeout(readyTimer);
        readyTimer = null;
      }
    };
    const init = async () => {
      const publicKey = String("APP_USR-14dcc809-f94d-4741-9c71-54ac8f5eb5d8").trim();
      if (!publicKey || publicKey.includes("00000000")) {
        marcarError("La configuración de pagos no está completa.");
        return;
      }
      try {
        await loadMercadoPagoSDK();
      } catch {
        marcarError("No se pudo cargar el módulo de pago seguro.");
        return;
      }
      let tries = 0;
      while (!document.getElementById(CONTENEDOR_ID) && tries < 100) {
        await new Promise((r) => setTimeout(r, 30));
        tries++;
      }
      const container = document.getElementById(CONTENEDOR_ID);
      if (!container) {
        marcarError("No se pudo inicializar el formulario.");
        return;
      }
      container.innerHTML = "";
      if (cancelled) return;
      readyTimer = setTimeout(() => {
        if (cancelled) return;
        if ((document.getElementById(CONTENEDOR_ID)?.childElementCount ?? 0) === 0) marcarError("No se pudo cargar el formulario de pago. Si estás en ventana privada, el navegador bloquea cookies de terceros que el SDK necesita.");
      }, READY_TIMEOUT_MS);
      try {
        const mp = new window.MercadoPago(publicKey, {
          locale: "es-MX",
          advancedFraudPrevention: false
        });
        const bricksBuilder = await mp.bricks();
        controllerRef.current = await bricksBuilder.create("cardPayment", CONTENEDOR_ID, {
          initialization: {
            amount: Math.max(1, Number(amount) || 1),
            payer: {
              email: payerEmail
            }
          },
          customization: {
            visual: {
              style: {
                theme: "default",
                customVariables: {
                  baseColor: "#171717",
                  baseColorFirstVariant: "#404040",
                  baseColorSecondVariant: "#262626",
                  textPrimaryColor: "#0a0a0a",
                  textSecondaryColor: "#525252",
                  inputBackgroundColor: "#ffffff",
                  inputFocusedBorderColor: "#171717",
                  buttonBackgroundColor: "#171717",
                  buttonTextColor: "#ffffff",
                  borderRadiusMedium: "4px",
                  borderRadiusLarge: "6px"
                }
              }
            },
            paymentMethods: {
              minInstallments: 1,
              maxInstallments: 12,
              types: {
                exclude: ["ticket", "atm", "bank_transfer", "prepaid_card", "digital_currency", "digital_wallet", "voucher_card", "crypto_transfer"]
              }
            }
          },
          callbacks: {
            onReady: () => {
              limpiarTimer();
              setEstado("listo");
              setErrorInterno(null);
            },
            onSubmit: (formData) => new Promise(async (resolve, reject) => {
              onClearError();
              try {
                const payload = {
                  items: items.map((i) => ({
                    id: i.producto.id,
                    cantidad: i.cantidad
                  })),
                  token: formData.token,
                  payment_method_id: formData.payment_method_id,
                  installments: Number(formData.installments ?? 1),
                  payer: {
                    email: String(formData?.payer?.email ?? payerEmail),
                    identification: formData?.payer?.identification ?? void 0
                  },
                  direccion: address?.direccion ?? null,
                  lat: address?.lat ?? null,
                  lng: address?.lng ?? null
                };
                const res = await fetch("/api/checkout/process-payment", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify(payload)
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  const msg = String(data?.error ?? "El pago no se pudo procesar.");
                  onError(msg);
                  reject(new Error(msg));
                  return;
                }
                onSuccess(data);
                resolve();
              } catch (err) {
                const msg = String(err?.message ?? "No pudimos conectar con el servidor de pagos.");
                onError(msg);
                reject(new Error(msg));
              }
            }),
            onError: () => {
              limpiarTimer();
              marcarError("Hubo un problema con el formulario de pago.");
            }
          }
        });
      } catch (e) {
        limpiarTimer();
        marcarError("No se pudo inicializar el formulario de pago.");
      }
    };
    init();
    return () => {
      cancelled = true;
      limpiarTimer();
      try {
        controllerRef.current?.unmount?.();
      } catch {
      }
    };
  }, [amount, payerEmail, address?.direccion, address?.lat, address?.lng]);
  return jsxs("div", {
    class: "overflow-hidden rounded-md border border-neutral-400 bg-neutral-200 shadow-lg",
    onInput: onClearError,
    onClick: onClearError,
    children: [jsxs("div", {
      class: "flex items-center gap-3 border-b border-neutral-300 bg-neutral-100 px-5 py-3",
      children: [jsx("span", {
        class: "grid h-9 w-9 place-items-center rounded-full bg-neutral-800 text-base text-white",
        "aria-hidden": "true",
        children: "🔒"
      }), jsxs("div", {
        class: "min-w-0",
        children: [jsx("p", {
          class: "text-sm font-bold text-neutral-900",
          children: "Pago seguro con tarjeta"
        }), jsx("p", {
          class: "font-mono text-[11px] uppercase tracking-wider text-neutral-600",
          children: "Procesado por Mercado Pago"
        })]
      })]
    }), jsxs("div", {
      class: "px-5 py-5",
      children: [estado === "cargando" && !errorInterno && jsxs("div", {
        class: "flex items-center gap-3 py-6",
        children: [jsx("span", {
          class: "h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-800"
        }), jsx("span", {
          class: "font-mono text-xs uppercase tracking-wider text-neutral-600",
          children: "Cargando formulario seguro…"
        })]
      }), estado === "error" && errorInterno && jsxs("div", {
        class: "rounded-sm border-l-4 border-destructive bg-destructive/5 px-3 py-3 text-sm text-neutral-800",
        children: [jsx("p", {
          class: "font-mono text-[10px] uppercase tracking-wider text-destructive",
          children: "Módulo de pago no disponible"
        }), jsx("p", {
          class: "mt-1",
          children: errorInterno
        })]
      }), jsx("div", {
        id: CONTENEDOR_ID,
        class: "min-h-[60px]"
      })]
    }), jsx("div", {
      class: "border-t border-neutral-300 bg-neutral-100 px-5 py-3",
      children: jsx("p", {
        class: "font-mono text-[10px] uppercase tracking-wider text-neutral-600",
        children: "🔒 Tus datos viajan encriptados a Mercado Pago."
      })
    })]
  });
}

function OxxoPaymentPanel({
  items,
  amount,
  payerEmail,
  address = null,
  onSuccess,
  onError,
  onClearError
}) {
  const [generando, setGenerando] = useState(false);
  const generar = async () => {
    onClearError();
    setGenerando(true);
    try {
      const res = await fetch("/api/checkout/process-oxxo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.producto.id,
            cantidad: i.cantidad
          })),
          payer: {
            email: payerEmail
          },
          direccion: address?.direccion ?? null,
          lat: address?.lat ?? null,
          lng: address?.lng ?? null
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(String(data?.error ?? "No se pudo generar el ticket OXXO."));
        return;
      }
      onSuccess(data);
    } catch (e) {
      onError(String(e?.message ?? "No pudimos conectar con el servidor."));
    } finally {
      setGenerando(false);
    }
  };
  return jsxs("div", {
    class: "rounded-md border border-border bg-surface p-6",
    children: [jsxs("div", {
      class: "mb-4 flex items-start gap-3",
      children: [jsx("span", {
        class: "grid h-10 w-10 place-items-center rounded-sm bg-primary/10 text-lg text-primary",
        "aria-hidden": "true",
        children: "🏪"
      }), jsxs("div", {
        class: "min-w-0",
        children: [jsx("p", {
          class: "text-sm font-bold text-foreground",
          children: "Pago en efectivo con OXXO"
        }), jsxs("p", {
          class: "mt-1 text-xs leading-relaxed text-muted",
          children: ["Se generará un ticket con código de barras. Tu pedido quedará en estado ", jsx("span", {
            class: "text-primary font-semibold",
            children: "PENDIENTE"
          }), " hasta que el pago sea confirmado."]
        })]
      })]
    }), jsxs("ul", {
      class: "mb-5 space-y-1.5 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-wider text-muted",
      children: [jsxs("li", {
        class: "flex justify-between",
        children: [jsx("span", {
          children: "Monto a pagar"
        }), jsxs("span", {
          class: "text-foreground",
          children: [formatPrecioMXN(amount), " MXN"]
        })]
      }), jsxs("li", {
        class: "flex justify-between",
        children: [jsx("span", {
          children: "Vigencia"
        }), jsx("span", {
          class: "text-foreground",
          children: "3 días naturales"
        })]
      }), jsxs("li", {
        class: "flex justify-between",
        children: [jsx("span", {
          children: "Comisión"
        }), jsx("span", {
          class: "text-foreground",
          children: "Incluida"
        })]
      })]
    }), jsxs("div", {
      class: "mb-4 border-l-2 border-primary/40 bg-primary/5 p-3 text-[11px] leading-relaxed text-muted",
      children: ["Al generar el ticket ", jsx("span", {
        class: "text-foreground",
        children: "reservamos el stock"
      }), " de tu pedido."]
    }), jsx(Button, {
      onClick: generar,
      disabled: generando,
      class: "w-full font-mono text-xs uppercase tracking-wider",
      children: generando ? "Generando ticket…" : "Generar ticket OXXO"
    })]
  });
}

function Label({
  class: className,
  ...props
}) {
  return jsx("label", {
    class: cn("text-label font-medium uppercase text-muted", className),
    ...props
  });
}

const MIN_CHARS = 3;
const DEBOUNCE_MS = 400;
const GEO_TIMEOUT_MS = 8e3;
function AddressAutocomplete({
  value,
  onChange,
  label = "Dirección de entrega"
}) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prefilling, setPrefilling] = useState(false);
  const [prefillError, setPrefillError] = useState(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const triedGeolocationRef = useRef(false);
  async function fetchSearch(q, signal) {
    const params = new URLSearchParams({
      q,
      format: "json",
      addressdetails: "1",
      limit: "5",
      countrycodes: "mx",
      "accept-language": "es"
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      signal,
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((r) => ({
      display_name: String(r.display_name ?? ""),
      lat: Number(r.lat),
      lng: Number(r.lon)
    }));
  }
  async function fetchReverse(lat, lng) {
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: "json",
        "accept-language": "es",
        zoom: "18",
        addressdetails: "1"
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
        headers: {
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(6e3)
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.display_name) return null;
      return {
        display_name: String(data.display_name),
        lat,
        lng
      };
    } catch {
      return null;
    }
  }
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = value.text.trim();
    if (q.length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchSearch(q, ac.signal);
        if (!ac.signal.aborted) setSuggestions(result);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError("No se pudo buscar. Escribe la dirección manualmente.");
        setSuggestions([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value.text]);
  async function tryGeolocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPrefillError("Tu navegador no soporta geolocalización.");
      return;
    }
    if (value.text.trim().length > 0) return;
    setPrefilling(true);
    setPrefillError(null);
    const timer = setTimeout(() => {
      setPrefilling(false);
      setPrefillError("No se pudo detectar tu ubicación automáticamente.");
    }, GEO_TIMEOUT_MS);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      clearTimeout(timer);
      const {
        latitude,
        longitude
      } = pos.coords;
      const suggestion = await fetchReverse(latitude, longitude);
      setPrefilling(false);
      if (!suggestion) {
        setPrefillError("No pudimos geocodificar tu ubicación. Escribe tu dirección.");
        return;
      }
      onChange({
        text: suggestion.display_name,
        lat: suggestion.lat,
        lng: suggestion.lng
      });
    }, (err) => {
      clearTimeout(timer);
      setPrefilling(false);
      if (err.code === err.PERMISSION_DENIED) setPrefillError("Permiso de ubicación denegado. Escribe tu dirección.");
      else setPrefillError("No pudimos obtener tu ubicación. Escribe tu dirección.");
    }, {
      enableHighAccuracy: false,
      timeout: GEO_TIMEOUT_MS,
      maximumAge: 3e5
    });
  }
  useEffect(() => {
    if (triedGeolocationRef.current) return;
    if (value.text.trim().length > 0) return;
    if (value.lat !== null && value.lng !== null) return;
    triedGeolocationRef.current = true;
    void tryGeolocation();
  }, []);
  const pick = (s) => {
    onChange({
      text: s.display_name,
      lat: s.lat,
      lng: s.lng
    });
    setSuggestions([]);
    setFocused(false);
    setPrefillError(null);
  };
  return jsxs("div", {
    class: "space-y-2",
    children: [jsx(Label, {
      for: "checkout-dir",
      children: label
    }), jsx(Input, {
      id: "checkout-dir",
      type: "text",
      autocomplete: "street-address",
      value: value.text,
      onFocus: () => setFocused(true),
      onBlur: () => setTimeout(() => setFocused(false), 150),
      onInput: (e) => onChange({
        text: e.target.value,
        lat: null,
        lng: null
      }),
      placeholder: "Calle, número, colonia, ciudad"
    }), prefilling && jsxs("div", {
      class: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted",
      children: [jsx("span", {
        class: "h-3 w-3 animate-spin rounded-full border border-border border-t-primary"
      }), "Detectando tu ubicación…"]
    }), value.lat !== null && value.lng !== null && !prefilling && jsx("p", {
      class: "font-mono text-[10px] uppercase tracking-wider text-success",
      children: "✓ Dirección validada en OpenStreetMap"
    }), prefillError && !prefilling && value.text.trim().length === 0 && jsxs("div", {
      class: "flex flex-wrap items-center gap-2",
      children: [jsx("p", {
        class: "text-[11px] text-muted",
        children: prefillError
      }), jsx("button", {
        type: "button",
        onClick: () => {
          triedGeolocationRef.current = false;
          void tryGeolocation();
        },
        class: "font-mono text-[10px] uppercase tracking-wider text-primary underline underline-offset-2 hover:text-primary-soft",
        children: "📍 Usar mi ubicación"
      })]
    }), focused && suggestions.length > 0 && jsx("ul", {
      class: "max-h-56 overflow-y-auto rounded-sm border border-border bg-elevated",
      children: suggestions.map((s, i) => jsx("li", {
        children: jsx("button", {
          type: "button",
          onMouseDown: (e) => {
            e.preventDefault();
            pick(s);
          },
          class: "block w-full px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-surface",
          children: s.display_name
        })
      }, `${s.lat}-${s.lng}-${i}`))
    }), focused && loading && jsxs("div", {
      class: "flex items-center gap-2 text-[10px] uppercase text-muted",
      children: [jsx("span", {
        class: "h-3 w-3 animate-spin rounded-full border border-border border-t-primary"
      }), "Buscando…"]
    }), error && jsx("p", {
      class: "text-xs text-destructive",
      children: error
    })]
  });
}

function CheckoutView() {
  const items = cartItems.value;
  const total = cartTotal.value;
  const usuario = currentUser.value;
  const [metodo, setMetodo] = useState("tarjeta");
  const [stockMap, setStockMap] = useState({});
  const [cargandoStock, setCargandoStock] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    text: "",
    lat: null,
    lng: null
  });
  useEffect(() => {
    let cancel = false;
    const cargar = async () => {
      setCargandoStock(true);
      try {
        if (items.length === 0) {
          if (!cancel) setStockMap({});
          return;
        }
        const results = await Promise.all(items.map((i) => gql(`query Q($id: ID!) { producto(id: $id) { id stock } }`, {
          id: i.producto.id
        }).catch(() => null)));
        const map = {};
        results.forEach((r) => {
          if (r?.producto) map[r.producto.id] = Number(r.producto.stock);
        });
        if (!cancel) setStockMap(map);
      } finally {
        if (!cancel) setCargandoStock(false);
      }
    };
    cargar();
    return () => {
      cancel = true;
    };
  }, [items.length]);
  const hayProblemaStock = items.some((i) => {
    const s = stockMap[i.producto.id];
    return typeof s === "number" && s < i.cantidad;
  });
  const sinSesion = !usuario;
  const handleSuccess = () => {
    clearCart();
    pedidoCreado();
  };
  const handleError = (msg) => setError(msg);
  const handleClearError = () => setError(null);
  const addressPayload = address.text.trim().length > 0 ? {
    direccion: address.text.trim(),
    lat: address.lat,
    lng: address.lng
  } : null;
  const mapAddress = address.lat !== null && address.lng !== null ? {
    lat: address.lat,
    lng: address.lng,
    text: address.text
  } : null;
  return jsxs("section", {
    class: "pt-8",
    children: [jsx("div", {
      class: "mb-6 border-b border-border pb-4",
      children: jsx("h2", {
        class: "text-heading font-bold",
        children: "Checkout"
      })
    }), sinSesion && jsxs("div", {
      class: "mb-6 border-l-2 border-primary bg-surface p-4 text-sm",
      children: [jsx("p", {
        class: "mb-1 font-mono text-xs uppercase text-primary",
        children: "Requiere sesión"
      }), jsxs("p", {
        class: "text-muted",
        children: ["Debes ", jsx("a", {
          href: "/login",
          class: "text-foreground underline underline-offset-2",
          children: "iniciar sesión"
        }), " para completar el pago."]
      })]
    }), jsxs("div", {
      class: "mb-8",
      children: [jsx("p", {
        class: "mb-3 text-label font-mono uppercase text-muted",
        children: "Revisión de items"
      }), jsx("div", {
        class: "divide-y divide-border border-y border-border",
        children: items.map((i) => {
          const stockActual = stockMap[i.producto.id];
          const insuficiente = typeof stockActual === "number" && stockActual < i.cantidad;
          return jsxs("div", {
            class: "py-4",
            children: [jsxs("div", {
              class: "flex items-center justify-between gap-4",
              children: [jsxs("div", {
                class: "min-w-0 flex-1",
                children: [jsx("p", {
                  class: "truncate text-sm font-medium",
                  children: String(i.producto.nombre)
                }), jsxs("p", {
                  class: "mt-1 font-mono text-xs text-muted",
                  children: [formatPrecioMXN(i.producto.precio), " MXN × ", String(i.cantidad).padStart(2, "0"), typeof stockActual === "number" && ` · stock: ${String(stockActual).padStart(2, "0")}`]
                })]
              }), jsx("span", {
                class: cn("font-mono text-sm font-semibold", insuficiente ? "text-destructive" : "text-primary"),
                children: formatPrecioMXN(Number(i.producto.precio) * i.cantidad)
              })]
            }), insuficiente && jsx("p", {
              class: "mt-2 font-mono text-[10px] uppercase text-destructive",
              children: "⚠ Stock insuficiente"
            })]
          }, i.producto.id);
        })
      })]
    }), !sinSesion && items.length > 0 && jsxs("div", {
      class: "mb-8 border-t border-border pt-6",
      children: [jsx("p", {
        class: "mb-3 text-label font-mono uppercase text-muted",
        children: "Envío"
      }), jsxs("div", {
        class: "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]",
        children: [jsxs("div", {
          class: "space-y-3",
          children: [jsx(AddressAutocomplete, {
            value: address,
            onChange: setAddress
          }), jsx("p", {
            class: "text-[11px] leading-relaxed text-muted",
            children: "Opcional. Si la omites, el pedido se registra sin dirección de entrega y se coordina por correo."
          })]
        }), jsxs("div", {
          class: "space-y-2",
          children: [jsx("p", {
            class: "text-label font-mono uppercase text-muted",
            children: "Origen CETI Colomos"
          }), jsx(CETIMap, {
            height: 180,
            address: mapAddress
          })]
        })]
      })]
    }), jsx("div", {
      class: "mb-8 flex items-end justify-between border-b border-border pb-4",
      children: jsxs("div", {
        children: [jsx("p", {
          class: "mb-1 font-mono text-label uppercase text-muted",
          children: "Total a pagar"
        }), jsxs("p", {
          class: "flex items-baseline gap-2",
          children: [jsx("span", {
            class: "font-mono text-3xl font-bold text-primary",
            children: formatPrecioMXN(total)
          }), jsx("span", {
            class: "font-mono text-sm uppercase text-muted",
            children: "MXN"
          })]
        }), jsx("p", {
          class: "mt-1 font-mono text-[10px] uppercase tracking-wider text-muted",
          children: currency.value === "USD" ? "Los pagos se procesan únicamente en pesos mexicanos (MXN)" : "Los pagos se procesan únicamente en pesos mexicanos"
        })]
      })
    }), !sinSesion && !hayProblemaStock && items.length > 0 && !cargandoStock && jsxs("div", {
      class: "mb-6",
      children: [jsxs("div", {
        class: "mb-5",
        children: [jsx("p", {
          class: "mb-3 text-label font-mono uppercase text-muted",
          children: "Método de pago"
        }), jsxs("div", {
          class: "grid grid-cols-1 gap-px bg-border sm:grid-cols-2",
          children: [jsxs("button", {
            type: "button",
            onClick: () => {
              setMetodo("tarjeta");
              setError(null);
            },
            class: cn("flex items-center gap-3 bg-background p-4 text-left transition-colors", metodo === "tarjeta" ? "ring-1 ring-primary" : "hover:bg-surface"),
            children: [jsx("span", {
              class: "grid h-9 w-9 place-items-center rounded-sm bg-elevated text-base",
              "aria-hidden": "true",
              children: "💳"
            }), jsxs("div", {
              class: "min-w-0",
              children: [jsx("p", {
                class: cn("text-sm font-semibold", metodo === "tarjeta" ? "text-primary" : "text-foreground"),
                children: "Tarjeta"
              }), jsx("p", {
                class: "font-mono text-[10px] uppercase tracking-wider text-muted",
                children: "Crédito o débito · inmediato"
              })]
            })]
          }), jsxs("button", {
            type: "button",
            onClick: () => {
              setMetodo("oxxo");
              setError(null);
            },
            class: cn("flex items-center gap-3 bg-background p-4 text-left transition-colors", metodo === "oxxo" ? "ring-1 ring-primary" : "hover:bg-surface"),
            children: [jsx("span", {
              class: "grid h-9 w-9 place-items-center rounded-sm bg-elevated text-base",
              "aria-hidden": "true",
              children: "🏪"
            }), jsxs("div", {
              class: "min-w-0",
              children: [jsx("p", {
                class: cn("text-sm font-semibold", metodo === "oxxo" ? "text-primary" : "text-foreground"),
                children: "OXXO"
              }), jsx("p", {
                class: "font-mono text-[10px] uppercase tracking-wider text-muted",
                children: "Efectivo · ticket de 3 días"
              })]
            })]
          })]
        })]
      }), metodo === "tarjeta" && jsx(CardPaymentBrick, {
        amount: Number(total),
        items,
        payerEmail: usuario?.email ?? "",
        address: addressPayload,
        onSuccess: handleSuccess,
        onError: handleError,
        onClearError: handleClearError
      }), metodo === "oxxo" && jsx(OxxoPaymentPanel, {
        items,
        amount: Number(total),
        payerEmail: usuario?.email ?? "",
        address: addressPayload,
        onSuccess: handleSuccess,
        onError: handleError,
        onClearError: handleClearError
      })]
    }), hayProblemaStock && jsx("div", {
      class: "mb-4 border-l-2 border-destructive bg-destructive/5 p-3 font-mono text-xs uppercase tracking-wider text-destructive",
      children: "Hay productos sin stock suficiente. Ajusta tu carrito para continuar."
    }), cargandoStock && !hayProblemaStock && jsxs("div", {
      class: "mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted",
      children: [jsx("span", {
        class: "h-3 w-3 animate-spin rounded-full border border-border border-t-primary"
      }), "Verificando stock…"]
    }), error && jsxs("div", {
      class: "mb-4 rounded-sm border-l-2 border-destructive bg-destructive/5 p-4 text-sm",
      children: [jsx("p", {
        class: "mb-1 font-mono text-xs uppercase text-destructive",
        children: "No se pudo completar el pago"
      }), jsx("p", {
        class: "text-muted",
        children: error
      })]
    }), jsx("div", {
      class: "flex justify-end gap-2",
      children: jsx(Button, {
        variant: "outline",
        onClick: irAlCarrito,
        class: "font-mono text-xs uppercase tracking-wider",
        children: "← Volver al carrito"
      })
    })]
  });
}

export { CheckoutView as default };
