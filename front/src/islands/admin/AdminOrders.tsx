import { useEffect, useState } from 'preact/hooks';
import { ApiError, gql, imgUrl } from '../../lib/api';
import { onRealtime, sinCarreras } from '../../lib/realtime';
import { formatFechaCorta, formatPrecio, formatTarjetaLabel, statusVariant, metodoPagoLabel } from '../../lib/format';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import CETIMap from '../CETIMap';
type PedidoDetalle = { id: string; cantidad: number; precio: number; producto: { id: string; nombre: string; imagen?: string | null } };
type Pedido = { id: string; fecha: string; total: number; status: string; metodoPago?: string | null; mpOrderId?: string | null; mpPaymentId?: string | null; mpPaymentMethod?: string | null; mpLast4?: string | null; mpInstallments?: number | null; mpTicketUrl?: string | null; mpBarcode?: string | null; mpReference?: string | null; mpExpiresAt?: string | null; direccion?: string | null; lat?: number | null; lng?: number | null; usuario: { id: string; nombre: string; email: string }; detalles: PedidoDetalle[] };
const ESTADOS = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'COMPLETADO', 'CANCELADO'] as const;
export default function AdminOrders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]); const [cargando, setCargando] = useState(true); const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null); const [procesando, setProcesando] = useState<string | null>(null);
  const cargar = async (silencioso?: unknown) => {
    if (silencioso !== true) setCargando(true); setError(null);
    try {
      const d = await sinCarreras(() => gql<{ pedidos: Pedido[] }>(`query { pedidos { id fecha total status metodoPago mpOrderId mpPaymentId mpPaymentMethod mpLast4 mpInstallments mpTicketUrl mpBarcode mpReference mpExpiresAt direccion lat lng usuario { id nombre email } detalles { id cantidad precio producto { id nombre imagen } } } }`));
      setPedidos(Array.isArray(d?.pedidos) ? d.pedidos : []);
    } catch (e: any) { setError(String(e?.message ?? 'Error')); } finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);
  useEffect(() => onRealtime((m) => {
    if (m.tipo === 'resync') { cargar(true); return; }
    const nuevo = m.data.pedido;
    setPedidos((prev) => (prev.some((p) => p.id === nuevo.id) ? prev : [nuevo, ...prev]));
  }), []);
  const cambiar = async (id: string, status: string) => {
    if (status === 'CANCELADO') return cancelar(id);
    setProcesando(id);
    try { await gql(`mutation U($id: ID!, $status: EstadoPedido!) { actualizarEstadoPedido(id: $id, status: $status) { id } }`, { id, status }); await cargar(); }
    catch (e: any) { alert(e instanceof ApiError ? e.errors[0]?.message : e.message); } finally { setProcesando(null); }
  };
  const cancelar = async (id: string) => {
    if (!confirm('¿Cancelar este pedido? Se restaurará el stock.')) return;
    setProcesando(id);
    try { await gql(`mutation C($id: ID!) { cancelarPedido(id: $id) { id } }`, { id }); await cargar(); }
    catch (e: any) { alert(e instanceof ApiError ? e.errors[0]?.message : e.message); } finally { setProcesando(null); }
  };
  if (cargando) return <div class="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} class="border border-border p-5"><Skeleton class="mb-3 h-3 w-1/4" /><Skeleton class="h-4 w-1/2" /></div>)}</div>;
  if (error) return <div class="border border-destructive/40 bg-destructive/5 p-4 text-sm"><p class="mb-3 text-muted">{error}</p><Button variant="outline" size="sm" onClick={cargar}>Reintentar</Button></div>;
  if (pedidos.length === 0) return <div class="border border-border py-16 text-center"><p class="mb-2 font-mono text-xs uppercase tracking-wider text-muted">Sin pedidos</p></div>;
  return (
    <div>
      <div class="mb-4 flex items-end justify-between"><p class="font-mono text-label uppercase text-muted">Todos los pedidos</p><span class="font-mono text-xs text-muted">{String(pedidos.length).padStart(2, '0')} registros</span></div>
      <div class="divide-y divide-border border-y border-border">{pedidos.map((p) => {
        const isOpen = expandido === p.id; const isProc = procesando === p.id; const cancelado = String(p.status).toUpperCase() === 'CANCELADO';
        const esOxxo = String(p.metodoPago ?? '').toLowerCase() === 'oxxo';
        const tarjetaLabel = !esOxxo ? formatTarjetaLabel(p.mpPaymentMethod, p.mpLast4, p.mpInstallments) : '';
        const tieneTarjeta = !esOxxo && !!(p.mpPaymentMethod || p.mpLast4); const tieneTicket = esOxxo && (p.mpReference || p.mpBarcode);
        const tieneDireccion = !!p.direccion || (p.lat != null && p.lng != null);
        return (
          <div key={p.id}>
            <button onClick={() => setExpandido(isOpen ? null : p.id)} aria-expanded={isOpen} class="grid w-full grid-cols-[80px_1fr_1fr_100px_120px_30px] items-center gap-4 py-3 text-left transition-colors hover:bg-surface"><span class="font-mono text-sm text-foreground">#{String(p.id).padStart(5, '0')}</span><span class="truncate text-sm">{p.usuario?.nombre ?? '—'}</span><span class="truncate font-mono text-xs text-muted">{p.usuario?.email ?? '—'}</span><span class="font-mono text-xs text-muted">{formatFechaCorta(p.fecha)}</span><span class={`font-mono text-sm font-semibold ${cancelado ? 'text-muted line-through' : 'text-primary'}`}>{formatPrecio(p.total)} MXN</span><span class="font-mono text-xs text-muted" aria-hidden="true">{isOpen ? '−' : '+'}</span></button>
            {isOpen && <div class="border-t border-border bg-surface/30 px-6 py-4"><div class="mb-4 flex flex-wrap items-center gap-4"><select value={p.status} disabled={isProc || cancelado} onChange={(e) => cambiar(p.id, (e.target as HTMLSelectElement).value)} aria-label={`Estado del pedido ${p.id}`} class="h-8 rounded-sm border border-border bg-elevated px-2 text-xs font-mono text-foreground">{ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}</select><Badge variant={statusVariant(p.status)}>{String(p.status)}</Badge><span class="font-mono text-[10px] uppercase tracking-wider text-muted">{metodoPagoLabel(p.metodoPago)}</span>{tieneTarjeta && <span class="font-mono text-[10px] uppercase tracking-wider text-muted">💳 {tarjetaLabel}</span>}{tieneTicket && <span class="font-mono text-[10px] uppercase tracking-wider text-primary">🏪 ref {p.mpReference}</span>}{!cancelado && <Button variant="ghost" size="sm" onClick={() => cancelar(p.id)} disabled={isProc} class="ml-auto font-mono text-xs uppercase tracking-wider text-destructive">Cancelar</Button>}</div>{tieneTicket && <div class="mb-4 rounded-sm border border-primary/30 bg-primary/5 p-3"><p class="mb-2 font-mono text-label uppercase text-primary">Ticket OXXO</p><div class="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3"><div><span class="text-muted">Ref:</span> <span class="font-mono text-foreground">{p.mpReference ?? '—'}</span></div><div><span class="text-muted">Código:</span> <span class="break-all font-mono text-foreground">{p.mpBarcode ?? '—'}</span></div><div><span class="text-muted">Vence:</span> <span class="font-mono text-foreground">{p.mpExpiresAt ? formatFechaCorta(p.mpExpiresAt) : '—'}</span></div></div>{p.mpOrderId && <p class="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">Order MP: <span class="text-foreground">{p.mpOrderId}</span></p>}{p.mpTicketUrl && <a href={p.mpTicketUrl} target="_blank" rel="noopener noreferrer" class="mt-2 inline-block font-mono text-[10px] uppercase tracking-wider text-primary underline">Ver ticket</a>}</div>}{tieneDireccion && <div class="mb-4 rounded-sm border border-border bg-background p-3"><p class="mb-2 font-mono text-label uppercase text-muted">Dirección de entrega</p>{p.direccion && <p class="text-xs text-foreground">{p.direccion}</p>}{p.lat != null && p.lng != null && <div class="mt-2"><CETIMap height={140} address={{ lat: Number(p.lat), lng: Number(p.lng), text: p.direccion ?? 'Destino' }} /></div>}</div>}<ul class="divide-y divide-border">{p.detalles.map((d) => <li key={d.id} class="flex items-center gap-4 py-3"><div class="h-10 w-10 flex-shrink-0 overflow-hidden border border-border bg-elevated"><img src={imgUrl(d.producto.imagen)} alt={String(d.producto.nombre)} width={40} height={40} class="h-full w-full object-cover" loading="lazy" decoding="async" /></div><span class="min-w-0 flex-1 truncate text-sm">{String(d.producto.nombre)}</span><span class="font-mono text-xs text-muted">{formatPrecio(d.precio)} × {String(d.cantidad).padStart(2, '0')}</span><span class="font-mono text-sm font-semibold text-primary">{formatPrecio(Number(d.precio) * d.cantidad)} MXN</span></li>)}</ul></div>}
          </div>
        );
      })}</div>
    </div>
  );
}
