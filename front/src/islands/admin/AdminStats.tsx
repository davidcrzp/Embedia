import { useEffect, useState } from 'preact/hooks';
import { gql } from '../../lib/api';
import { onRealtime, sinCarreras } from '../../lib/realtime';
import { formatFechaCorta, formatPrecio, statusVariant, metodoPagoLabel } from '../../lib/format';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
type PedidoRow = { id: string; total: number; status: string; fecha: string; metodoPago?: string | null };
type Data = { pedidos: PedidoRow[]; productos: { id: string; nombre: string; stock: number; precio: number }[]; usuarios: { id: string; rol: string }[]; categorias: { id: string; totalProductos: number }[] };
const EMPTY: Data = { pedidos: [], productos: [], usuarios: [], categorias: [] };
export default function AdminStats({ onVerPedidos }: { onVerPedidos: () => void }) {
  const [data, setData] = useState<Data>(EMPTY); const [cargando, setCargando] = useState(true); const [error, setError] = useState<string | null>(null);
  const cargar = async (silencioso?: unknown) => {
    if (silencioso !== true) setCargando(true); setError(null);
    try {
      const d = await sinCarreras(() => gql<any>(`query { pedidos { id total status fecha metodoPago } productos(limit: 1000, offset: 0) { id nombre stock precio } usuarios { id rol } categorias { id totalProductos } }`));
      setData({ pedidos: Array.isArray(d?.pedidos) ? d.pedidos : [], productos: Array.isArray(d?.productos) ? d.productos : [], usuarios: Array.isArray(d?.usuarios) ? d.usuarios : [], categorias: Array.isArray(d?.categorias) ? d.categorias : [] });
    } catch (e: any) { setError(String(e?.message ?? 'Error')); } finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);
  useEffect(() => onRealtime((m) => {
    if (m.tipo === 'resync') { cargar(true); return; }
    const { pedido, productos } = m.data;
    setData((d) => ({ ...d, pedidos: d.pedidos.some((p) => p.id === pedido.id) ? d.pedidos : [pedido, ...d.pedidos], productos: d.productos.map((p) => { const n = productos.find((x) => x.id === p.id); return n ? { ...p, stock: n.stock } : p; }) }));
  }), []);
  if (cargando) return <div class="grid grid-cols-2 gap-px bg-border md:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} class="space-y-3 bg-background p-6"><Skeleton class="h-3 w-1/2" /><Skeleton class="h-8 w-3/4" /></div>)}</div>;
  if (error) return <div class="border border-destructive/40 bg-destructive/5 p-4 text-sm"><p class="mb-3 text-muted">{error}</p><Button variant="outline" size="sm" onClick={cargar}>Reintentar</Button></div>;
  const totalVentas = data.pedidos.filter((p) => String(p.status).toUpperCase() !== 'CANCELADO').reduce((s, p) => s + Number(p.total), 0);
  const pendientes = data.pedidos.filter((p) => String(p.status).toUpperCase() === 'PENDIENTE').length;
  const clientes = data.usuarios.filter((u) => u.rol === 'CLIENTE').length; const admins = data.usuarios.filter((u) => u.rol === 'ADMIN').length;
  const stockTotal = data.productos.reduce((s, p) => s + Number(p.stock), 0); const sinStock = data.productos.filter((p) => Number(p.stock) === 0).length;
  const metricas = [
    { label: 'Pedidos', value: String(data.pedidos.length).padStart(2, '0') },
    { label: 'Ventas (MXN)', value: formatPrecio(totalVentas) },
    { label: 'Pendientes', value: String(pendientes).padStart(2, '0') },
    { label: 'Productos', value: String(data.productos.length).padStart(2, '0') },
    { label: 'Stock total', value: String(stockTotal).padStart(3, '0') },
    { label: 'Sin stock', value: String(sinStock).padStart(2, '0') },
    { label: 'Categorías', value: String(data.categorias.length).padStart(2, '0') },
    { label: 'Usuarios', value: `${clientes}+${admins}` },
  ];
  const recientes = data.pedidos.slice(0, 5);
  return (
    <div class="space-y-10">
      <div><p class="mb-4 font-mono text-label uppercase text-muted">Métricas</p><div class="grid grid-cols-2 gap-px bg-border md:grid-cols-4 lg:grid-cols-8">{metricas.map((m) => <div key={m.label} class="bg-background p-6"><p class="mb-2 font-mono text-label uppercase text-muted">{m.label}</p><p class="font-mono text-2xl font-bold text-primary">{m.value}</p></div>)}</div></div>
      <div><div class="mb-4 flex items-end justify-between"><p class="font-mono text-label uppercase text-muted">Pedidos recientes</p><Button variant="outline" size="sm" onClick={onVerPedidos} class="font-mono text-xs uppercase tracking-wider">Ver todos</Button></div>{recientes.length === 0 ? <div class="border border-border py-8 text-center"><p class="font-mono text-xs uppercase tracking-wider text-muted">Sin pedidos aún</p></div> : <div class="divide-y divide-border border-y border-border">{recientes.map((p) => <div key={p.id} class="grid grid-cols-[80px_1fr_100px_120px_100px] items-center gap-4 py-3"><span class="font-mono text-sm text-foreground">#{String(p.id).padStart(5, '0')}</span><span class="font-mono text-xs text-muted">{formatFechaCorta(p.fecha)}</span><span class="font-mono text-[10px] uppercase tracking-wider text-muted">{metodoPagoLabel(p.metodoPago)}</span><Badge variant={statusVariant(p.status)}>{String(p.status)}</Badge><span class="text-right font-mono text-sm font-semibold text-primary">{formatPrecio(p.total)} MXN</span></div>)}</div>}</div>
    </div>
  );
}
