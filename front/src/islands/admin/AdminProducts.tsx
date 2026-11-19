import { useEffect, useState } from 'preact/hooks';
import { gql, imgUrl } from '../../lib/api';
import { onRealtime, sinCarreras } from '../../lib/realtime';
import { formatPrecio } from '../../lib/format';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import ProductDialog from './ProductDialog';
export type Categoria = { id: string; nombre: string };
export type AdminProducto = { id: string; nombre: string; precio: number; imagen?: string | null; stock: number; categoria?: { id: string; nombre: string } | null };
export default function AdminProducts() {
  const [productos, setProductos] = useState<AdminProducto[]>([]); const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true); const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false); const [editando, setEditando] = useState<AdminProducto | null>(null);
  const cargar = async (silencioso?: unknown) => {
    if (silencioso !== true) setCargando(true); setError(null);
    try {
      const d = await sinCarreras(() => gql<{ productos: AdminProducto[]; categorias: Categoria[] }>(`query { productos(limit: 500, offset: 0) { id nombre precio imagen stock categoria { id nombre } } categorias { id nombre } }`));
      setProductos(Array.isArray(d?.productos) ? d.productos : []); setCategorias(Array.isArray(d?.categorias) ? d.categorias : []);
    } catch (e: any) { setError(String(e?.message ?? 'Error')); } finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);
  useEffect(() => onRealtime((m) => {
    if (m.tipo === 'resync') { cargar(true); return; }
    const nuevos = m.data.productos;
    setProductos((prev) => prev.map((p) => { const n = nuevos.find((x) => x.id === p.id); return n ? { ...p, stock: n.stock } : p; }));
  }), []);
  const eliminar = async (p: AdminProducto) => {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try { await gql(`mutation E($id: ID!) { eliminarProducto(id: $id) }`, { id: p.id }); await cargar(); } catch (e: any) { alert(String(e?.message ?? 'Error')); }
  };
  if (cargando) return <div class="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} class="grid grid-cols-[60px_1fr_120px_100px_80px_120px] gap-4 border border-border p-3"><Skeleton class="h-12 w-12" /><Skeleton class="h-4 w-2/3" /><Skeleton class="h-4 w-1/2" /><Skeleton class="h-4 w-1/2" /><Skeleton class="h-4 w-1/2" /><Skeleton class="h-4 w-1/2" /></div>)}</div>;
  if (error) return <div class="border border-destructive/40 bg-destructive/5 p-4 text-sm">{error}</div>;
  return (
    <div>
      <div class="mb-4 flex justify-between"><span class="font-mono text-xs text-muted">{productos.length} productos</span><Button onClick={() => { setEditando(null); setOpen(true); }} class="font-mono text-xs uppercase">+ Nuevo</Button></div>
      <div class="divide-y divide-border">{productos.map((p) => <div key={p.id} class="grid grid-cols-[60px_1fr_140px_110px_80px_150px] items-center gap-4 py-3"><div class="h-12 w-12 overflow-hidden border border-border bg-elevated"><img src={imgUrl(p.imagen)} alt={p.nombre} width={48} height={48} class="h-full w-full object-cover" loading="lazy" decoding="async" /></div><div><p class="truncate text-sm">{p.nombre}</p></div><span class="font-mono text-xs text-muted">{p.categoria?.nombre ?? '—'}</span><span class="font-mono text-sm font-semibold text-primary">{formatPrecio(p.precio)} MXN</span><Badge variant={p.stock === 0 ? 'destructive' : 'muted'}>{p.stock}</Badge><div class="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => { setEditando(p); setOpen(true); }}>Editar</Button><Button variant="ghost" size="sm" onClick={() => eliminar(p)} aria-label={`Eliminar ${p.nombre}`} class="text-destructive">×</Button></div></div>)}</div>
      <ProductDialog open={open} onClose={() => setOpen(false)} onSaved={cargar} producto={editando} categorias={categorias} />
    </div>
  );
}
