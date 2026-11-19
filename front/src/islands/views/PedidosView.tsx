import { useEffect, useState } from 'preact/hooks';
import { ApiError, gql, imgUrl } from '../../lib/api';
import { currentUser } from '../../stores/auth';
import { irAHome } from '../../stores/flow';
import { formatFecha, formatPrecio, formatTarjetaLabel, statusVariant, metodoPagoLabel } from '../../lib/format';
import type { Pedido } from '../../lib/types';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import CETIMap from '../CETIMap';
function copiar(texto: string) { if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(texto).catch(() => {}); }
export default function PedidosView() {
  const usuario = currentUser.value;
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cargar = async () => {
    setCargando(true); setError(null);
    try {
      const data = await gql<{ misPedidos: Pedido[] }>(`query { misPedidos { id fecha total status metodoPago mpOrderId mpPaymentId mpPaymentMethod mpLast4 mpInstallments mpTicketUrl mpBarcode mpReference mpExpiresAt direccion lat lng detalles { id cantidad precio producto { id nombre imagen } } } }`);
      setPedidos(Array.isArray(data?.misPedidos) ? data.misPedidos : []);
    } catch (e: any) {
      if (e instanceof ApiError) { const g = e.errors[0]; if (g?.extensions?.code === 'UNAUTHENTICATED') setPedidos([]); else setError(String(g?.message ?? 'Error al cargar pedidos')); } else setError(String(e?.message ?? 'Error al cargar pedidos'));
    } finally { setCargando(false); }
  };
  useEffect(() => { if (!usuario) { setPedidos([]); setError(null); setCargando(false); return; } cargar(); }, [usuario?.id]);
  if (cargando) return <section class="pt-8"><div class="mb-6 flex items-end justify-between border-b border-border pb-4"><h2 class="text-heading font-bold">Mis pedidos</h2><span class="font-mono text-xs text-muted">Cargando…</span></div><div class="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} class="border border-border p-6"><Skeleton class="mb-3 h-3 w-1/4" /><Skeleton class="mb-4 h-4 w-1/2" /><Skeleton class="h-3 w-1/3" /></div>)}</div></section>;
  if (error) return <section class="pt-8"><div class="mb-6 border-b border-border pb-4"><h2 class="text-heading font-bold">Mis pedidos</h2></div><div class="border border-destructive/40 bg-destructive/5 p-4 text-sm"><p class="mb-2 font-mono text-xs uppercase text-destructive">Error</p><p class="mb-3 text-muted">{error}</p><Button variant="outline" size="sm" onClick={cargar}>Reintentar</Button></div></section>;
  if (pedidos.length === 0) return <section class="pt-8"><div class="mb-6 flex items-end justify-between border-b border-border pb-4"><h2 class="text-heading font-bold">Mis pedidos</h2><span class="font-mono text-xs text-muted">00 pedidos</span></div><div class="border border-border py-16 text-center"><p class="mb-2 font-mono text-xs uppercase tracking-wider text-muted">Vacío</p><p class="mb-6 text-sm text-muted">Aún no has realizado ninguna compra.</p><Button onClick={irAHome}>Ir al catálogo</Button></div></section>;
  return (
    <section class="pt-8">
      <div class="mb-6 flex items-end justify-between border-b border-border pb-4"><h2 class="text-heading font-bold">Mis pedidos</h2><span class="font-mono text-xs text-muted">{String(pedidos.length).padStart(2, '0')} pedidos</span></div>
      <div class="space-y-6">{pedidos.map((pedido) => {
        const esOxxo = String(pedido.metodoPago ?? '').toLowerCase() === 'oxxo'; const pendiente = String(pedido.status).toUpperCase() === 'PENDIENTE';
        const mostrarTicket = esOxxo && pendiente && (pedido.mpBarcode || pedido.mpTicketUrl || pedido.mpReference);
        const tarjetaLabel = !esOxxo ? formatTarjetaLabel(pedido.mpPaymentMethod, pedido.mpLast4, pedido.mpInstallments) : '';
        const tieneTarjeta = !esOxxo && !!(pedido.mpPaymentMethod || pedido.mpLast4);
        const tieneDireccion = !!pedido.direccion || (pedido.lat != null && pedido.lng != null);
        return (
          <article key={pedido.id} class="border border-border">
            <header class="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface/40 p-4">
              <div class="flex flex-wrap items-center gap-6 font-mono text-xs"><div><p class="mb-0.5 text-label uppercase text-muted">Pedido</p><p class="text-sm font-semibold text-foreground">#{String(pedido.id).padStart(5, '0')}</p></div><div><p class="mb-0.5 text-label uppercase text-muted">Fecha</p><p class="text-foreground">{formatFecha(pedido.fecha)}</p></div><div><p class="mb-0.5 text-label uppercase text-muted">Total</p><p class="text-sm font-semibold text-primary">{formatPrecio(pedido.total)} MXN</p></div><div><p class="mb-0.5 text-label uppercase text-muted">Método</p><p class="flex items-center gap-1.5 text-foreground"><span aria-hidden="true">{esOxxo ? '🏪' : '💳'}</span><span>{metodoPagoLabel(pedido.metodoPago)}</span></p></div>{tieneTarjeta && <div><p class="mb-0.5 text-label uppercase text-muted">Tarjeta</p><p class="flex items-center gap-1.5 text-foreground"><span>{tarjetaLabel}</span></p></div>}</div>
              <Badge variant={statusVariant(pedido.status)}>{String(pedido.status)}</Badge>
            </header>
            {mostrarTicket && <div class="border-b border-border bg-primary/5 p-4"><div class="mb-3 flex items-center justify-between gap-2"><p class="font-mono text-label uppercase text-primary">🏪 Ticket OXXO pendiente de pago</p><span class="font-mono text-[10px] uppercase tracking-wider text-muted">Vence: {pedido.mpExpiresAt ? formatFecha(pedido.mpExpiresAt) : '—'}</span></div><div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><p class="mb-1 text-label font-mono uppercase text-muted">Referencia</p><div class="flex items-center gap-2"><p class="font-mono text-sm font-semibold text-foreground">{pedido.mpReference ?? '—'}</p>{pedido.mpReference && <button type="button" onClick={() => copiar(String(pedido.mpReference))} class="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-primary">Copiar</button>}</div></div><div><p class="mb-1 text-label font-mono uppercase text-muted">Código de barras</p><div class="flex items-start gap-2"><p class="break-all font-mono text-xs text-foreground">{pedido.mpBarcode ?? '—'}</p>{pedido.mpBarcode && <button type="button" onClick={() => copiar(String(pedido.mpBarcode))} class="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-primary">Copiar</button>}</div></div><div><p class="mb-1 text-label font-mono uppercase text-muted">Monto a pagar</p><p class="font-mono text-sm font-semibold text-primary">{formatPrecio(pedido.total)} MXN</p></div><div><p class="mb-1 text-label font-mono uppercase text-muted">Estado</p><p class="font-mono text-sm text-foreground">Esperando pago en tienda</p></div></div>{pedido.mpTicketUrl && <div class="mt-4 flex flex-wrap gap-2"><a href={pedido.mpTicketUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" class="font-mono text-xs uppercase tracking-wider">🖨 Ver / imprimir ticket</Button></a></div>}<p class="mt-3 text-[11px] leading-relaxed text-muted">Acude a cualquier tienda OXXO con el número de referencia o código de barras y paga el monto exacto.</p></div>}
            <ul class="divide-y divide-border">{pedido.detalles.map((d) => <li key={d.id} class="flex items-center gap-4 p-4"><div class="h-12 w-12 flex-shrink-0 overflow-hidden border border-border bg-elevated"><img src={imgUrl(d.producto.imagen)} alt={String(d.producto.nombre)} width={48} height={48} class="h-full w-full object-cover" loading="lazy" decoding="async" /></div><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{String(d.producto.nombre)}</p><p class="mt-0.5 font-mono text-xs text-muted">{formatPrecio(d.precio)} × {String(d.cantidad).padStart(2, '0')}</p></div><span class="font-mono text-sm font-semibold text-primary">{formatPrecio(Number(d.precio) * d.cantidad)}</span></li>)}</ul>
            {tieneDireccion && (
              <div class="border-t border-border p-4"><p class="mb-2 text-label font-mono uppercase text-muted">Envío</p><div class="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_280px]"><div class="space-y-1">{pedido.direccion && <p class="text-sm text-foreground">{pedido.direccion}</p>}{pedido.lat != null && pedido.lng != null && (<p class="font-mono text-[10px] uppercase tracking-wider text-muted">Ruta desde CETI Colomos</p>)}</div>{pedido.lat != null && pedido.lng != null && (<CETIMap height={160} address={{ lat: Number(pedido.lat), lng: Number(pedido.lng), text: pedido.direccion ?? 'Destino' }} />)}</div></div>
            )}
          </article>
        );
      })}</div>
      <div class="mt-8 flex justify-start"><Button variant="outline" onClick={irAHome} class="font-mono text-xs uppercase tracking-wider">← Volver al catálogo</Button></div>
    </section>
  );
}
