import { useEffect, useState } from 'preact/hooks';
import { ApiError, gql } from '../../lib/api';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import CategoryDialog from './CategoryDialog';
export type AdminCategoria = { id: string; nombre: string; totalProductos: number };
export default function AdminCategories() {
  const [categorias, setCategorias] = useState<AdminCategoria[]>([]); const [cargando, setCargando] = useState(true); const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false); const [editando, setEditando] = useState<AdminCategoria | null>(null);
  const cargar = async () => {
    setCargando(true); setError(null);
    try { const d = await gql<any>(`query { categorias { id nombre totalProductos } }`); setCategorias(Array.isArray(d?.categorias) ? d.categorias : []); }
    catch (e: any) { setError(String(e?.message ?? 'Error')); } finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);
  const eliminar = async (c: AdminCategoria) => {
    if (c.totalProductos > 0) return alert('Tiene productos asignados');
    if (!confirm(`¿Eliminar "${c.nombre}"?`)) return;
    try { await gql(`mutation D($id: ID!) { eliminarCategoria(id: $id) }`, { id: c.id }); await cargar(); } catch (e: any) { alert(e instanceof ApiError ? e.errors[0]?.message : e.message); }
  };
  if (cargando) return <div class="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} class="h-8 w-full" />)}</div>;
  if (error) return <div class="border border-destructive/40 bg-destructive/5 p-4 text-sm">{error}</div>;
  return (
    <div>
      <div class="mb-4 flex justify-between"><span class="font-mono text-xs text-muted">{categorias.length} categorías</span><Button onClick={() => { setEditando(null); setOpen(true); }} class="font-mono text-xs uppercase">+ Nueva</Button></div>
      <div class="divide-y divide-border">{categorias.map((c) => <div key={c.id} class="grid grid-cols-[60px_1fr_140px_200px] items-center gap-4 py-3"><span class="font-mono text-sm text-muted">#{String(c.id).padStart(2, '0')}</span><span class="text-sm">{c.nombre}</span><Badge variant={c.totalProductos > 0 ? 'solid' : 'muted'}>{c.totalProductos} productos</Badge><div class="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => { setEditando(c); setOpen(true); }}>Editar</Button><Button variant="ghost" size="sm" onClick={() => eliminar(c)} disabled={c.totalProductos > 0} aria-label={`Eliminar ${c.nombre}`} class="text-destructive">×</Button></div></div>)}</div>
      <CategoryDialog open={open} onClose={() => setOpen(false)} onSaved={cargar} categoria={editando} />
    </div>
  );
}
