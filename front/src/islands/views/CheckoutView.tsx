import { useEffect, useState } from 'preact/hooks';
import { gql } from '../../lib/api';
import { cartItems, cartTotal, clearCart } from '../../stores/cart';
import { currentUser } from '../../stores/auth';
import { irAlCarrito, pedidoCreado } from '../../stores/flow';
import { formatPrecioMXN } from '../../lib/format';
import { currency } from '../../lib/currency';
import { cn } from '../../ui/cn';
import { Button } from '../../ui/button';
import CardPaymentBrick from '../checkout/CardPaymentBrick';
import OxxoPaymentPanel from '../checkout/OxxoPaymentPanel';
import AddressAutocomplete, { type AddressValue } from '../checkout/AddressAutocomplete';
import CETIMap from '../CETIMap';
type StockMap = Record<string, number>;
type MetodoPago = 'tarjeta' | 'oxxo';
export default function CheckoutView() {
  const items = cartItems.value;
  const total = cartTotal.value;
  const usuario = currentUser.value;
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta');
  const [stockMap, setStockMap] = useState<StockMap>({});
  const [cargandoStock, setCargandoStock] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<AddressValue>({ text: '', lat: null, lng: null });
  useEffect(() => {
    let cancel = false;
    const cargar = async () => {
      setCargandoStock(true);
      try {
        if (items.length === 0) { if (!cancel) setStockMap({}); return; }
        const results = await Promise.all(items.map((i) => gql<{ producto: { id: string; stock: number } | null }>(`query Q($id: ID!) { producto(id: $id) { id stock } }`, { id: i.producto.id }).catch(() => null)));
        const map: StockMap = {};
        results.forEach((r) => { if (r?.producto) map[r.producto.id] = Number(r.producto.stock); });
        if (!cancel) setStockMap(map);
      } finally { if (!cancel) setCargandoStock(false); }
    };
    cargar();
    return () => { cancel = true; };
  }, [items.length]);
  const hayProblemaStock = items.some((i) => { const s = stockMap[i.producto.id]; return typeof s === 'number' && s < i.cantidad; });
  const sinSesion = !usuario;
  const handleSuccess = () => { clearCart(); pedidoCreado(); };
  const handleError = (msg: string) => setError(msg);
  const handleClearError = () => setError(null);
  const addressPayload = address.text.trim().length > 0 ? { direccion: address.text.trim(), lat: address.lat, lng: address.lng } : null;
  const mapAddress = address.lat !== null && address.lng !== null ? { lat: address.lat, lng: address.lng, text: address.text } : null;
  return (
    <section class="pt-8">
      <div class="mb-6 border-b border-border pb-4"><h2 class="text-heading font-bold">Checkout</h2></div>
      {sinSesion && (<div class="mb-6 border-l-2 border-primary bg-surface p-4 text-sm"><p class="mb-1 font-mono text-xs uppercase text-primary">Requiere sesión</p><p class="text-muted">Debes <a href="/login" class="text-foreground underline underline-offset-2">iniciar sesión</a> para completar el pago.</p></div>)}
      <div class="mb-8">
        <p class="mb-3 text-label font-mono uppercase text-muted">Revisión de items</p>
        <div class="divide-y divide-border border-y border-border">
          {items.map((i) => {
            const stockActual = stockMap[i.producto.id];
            const insuficiente = typeof stockActual === 'number' && stockActual < i.cantidad;
            return (
              <div key={i.producto.id} class="py-4">
                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{String(i.producto.nombre)}</p><p class="mt-1 font-mono text-xs text-muted">{formatPrecioMXN(i.producto.precio)} MXN × {String(i.cantidad).padStart(2, '0')}{typeof stockActual === 'number' && ` · stock: ${String(stockActual).padStart(2, '0')}`}</p></div>
                  <span class={cn('font-mono text-sm font-semibold', insuficiente ? 'text-destructive' : 'text-primary')}>{formatPrecioMXN(Number(i.producto.precio) * i.cantidad)}</span>
                </div>
                {insuficiente && <p class="mt-2 font-mono text-[10px] uppercase text-destructive">⚠ Stock insuficiente</p>}
              </div>
            );
          })}
        </div>
      </div>
      {!sinSesion && items.length > 0 && (
        <div class="mb-8 border-t border-border pt-6">
          <p class="mb-3 text-label font-mono uppercase text-muted">Envío</p>
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div class="space-y-3"><AddressAutocomplete value={address} onChange={setAddress} /><p class="text-[11px] leading-relaxed text-muted">Opcional. Si la omites, el pedido se registra sin dirección de entrega y se coordina por correo.</p></div>
            <div class="space-y-2"><p class="text-label font-mono uppercase text-muted">Origen CETI Colomos</p><CETIMap height={180} address={mapAddress} /></div>
          </div>
        </div>
      )}
      <div class="mb-8 flex items-end justify-between border-b border-border pb-4">
        <div>
          <p class="mb-1 font-mono text-label uppercase text-muted">Total a pagar</p>
          <p class="flex items-baseline gap-2"><span class="font-mono text-3xl font-bold text-primary">{formatPrecioMXN(total)}</span><span class="font-mono text-sm uppercase text-muted">MXN</span></p>
          <p class="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">{currency.value === 'USD' ? 'Los pagos se procesan únicamente en pesos mexicanos (MXN)' : 'Los pagos se procesan únicamente en pesos mexicanos'}</p>
        </div>
      </div>
      {!sinSesion && !hayProblemaStock && items.length > 0 && !cargandoStock && (
        <div class="mb-6">
          <div class="mb-5">
            <p class="mb-3 text-label font-mono uppercase text-muted">Método de pago</p>
            <div class="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
              <button type="button" onClick={() => { setMetodo('tarjeta'); setError(null); }} class={cn('flex items-center gap-3 bg-background p-4 text-left transition-colors', metodo === 'tarjeta' ? 'ring-1 ring-primary' : 'hover:bg-surface')}>
                <span class="grid h-9 w-9 place-items-center rounded-sm bg-elevated text-base" aria-hidden="true">💳</span>
                <div class="min-w-0"><p class={cn('text-sm font-semibold', metodo === 'tarjeta' ? 'text-primary' : 'text-foreground')}>Tarjeta</p><p class="font-mono text-[10px] uppercase tracking-wider text-muted">Crédito o débito · inmediato</p></div>
              </button>
              <button type="button" onClick={() => { setMetodo('oxxo'); setError(null); }} class={cn('flex items-center gap-3 bg-background p-4 text-left transition-colors', metodo === 'oxxo' ? 'ring-1 ring-primary' : 'hover:bg-surface')}>
                <span class="grid h-9 w-9 place-items-center rounded-sm bg-elevated text-base" aria-hidden="true">🏪</span>
                <div class="min-w-0"><p class={cn('text-sm font-semibold', metodo === 'oxxo' ? 'text-primary' : 'text-foreground')}>OXXO</p><p class="font-mono text-[10px] uppercase tracking-wider text-muted">Efectivo · ticket de 3 días</p></div>
              </button>
            </div>
          </div>
          {metodo === 'tarjeta' && (<CardPaymentBrick amount={Number(total)} items={items} payerEmail={usuario?.email ?? ''} address={addressPayload} onSuccess={handleSuccess} onError={handleError} onClearError={handleClearError} />)}
          {metodo === 'oxxo' && (<OxxoPaymentPanel items={items} amount={Number(total)} payerEmail={usuario?.email ?? ''} address={addressPayload} onSuccess={handleSuccess} onError={handleError} onClearError={handleClearError} />)}
        </div>
      )}
      {hayProblemaStock && (<div class="mb-4 border-l-2 border-destructive bg-destructive/5 p-3 font-mono text-xs uppercase tracking-wider text-destructive">Hay productos sin stock suficiente. Ajusta tu carrito para continuar.</div>)}
      {cargandoStock && !hayProblemaStock && (<div class="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted"><span class="h-3 w-3 animate-spin rounded-full border border-border border-t-primary" />Verificando stock…</div>)}
      {error && (<div class="mb-4 rounded-sm border-l-2 border-destructive bg-destructive/5 p-4 text-sm"><p class="mb-1 font-mono text-xs uppercase text-destructive">No se pudo completar el pago</p><p class="text-muted">{error}</p></div>)}
      <div class="flex justify-end gap-2"><Button variant="outline" onClick={irAlCarrito} class="font-mono text-xs uppercase tracking-wider">← Volver al carrito</Button></div>
    </section>
  );
}
