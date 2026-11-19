import { useEffect, useRef, useState } from 'preact/hooks';
import { ApiError, gql, imgUrl, uploadImage } from '../../lib/api';
import { Dialog } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import type { AdminProducto, Categoria } from './AdminProducts';
type Props = { open: boolean; onClose: () => void; onSaved: () => void; producto: AdminProducto | null; categorias: Categoria[] };
type FormState = { nombre: string; precio: string; imagen: string; stock: string; categoriaId: string };
const EMPTY: FormState = { nombre: '', precio: '', imagen: '', stock: '0', categoriaId: '' };
export default function ProductDialog({ open, onClose, onSaved, producto, categorias }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY); const [enviando, setEnviando] = useState(false); const [subiendo, setSubiendo] = useState(false); const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement | null>(null); const esEdicion = !!producto;
  useEffect(() => { if (!open) return; if (producto) setForm({ nombre: producto.nombre, precio: String(producto.precio), imagen: producto.imagen ?? '', stock: String(producto.stock), categoriaId: producto.categoria?.id ?? categorias[0]?.id ?? '' }); else setForm({ ...EMPTY, categoriaId: categorias[0]?.id ?? '' }); setError(null); }, [open, producto?.id]);
  const onPick = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; setSubiendo(true); setError(null);
    try { const url = await uploadImage(f); setForm((x) => ({ ...x, imagen: url })); } catch (e: any) { setError(String(e?.message ?? 'Error al subir')); } finally { setSubiendo(false); if (ref.current) ref.current.value = ''; }
  };
  const onSubmit = async (e: Event) => {
    e.preventDefault(); setError(null);
    const precio = Number(form.precio); const stock = Number(form.stock);
    if (!form.nombre.trim() || !Number.isFinite(precio) || precio <= 0 || !Number.isInteger(stock) || stock < 0 || !form.categoriaId) { setError('Revisa los campos'); return; }
    setEnviando(true);
    try {
      const input = { nombre: form.nombre.trim(), precio, imagen: form.imagen.trim() || null, stock, categoriaId: form.categoriaId };
      if (esEdicion && producto) await gql(`mutation U($id: ID!, $input: ProductoUpdateInput!) { actualizarProducto(id: $id, input: $input) { id } }`, { id: producto.id, input });
      else await gql(`mutation C($input: ProductoInput!) { crearProducto(input: $input) { id } }`, { input });
      onSaved(); onClose();
    } catch (e: any) { setError(e instanceof ApiError ? String(e.errors[0]?.message) : String(e?.message ?? 'Error')); } finally { setEnviando(false); }
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={onSubmit} class="space-y-4">
        <h2 class="text-heading font-bold">{esEdicion ? 'Editar' : 'Nuevo producto'}</h2>
        <div class="space-y-2"><Label for="prod-nombre">Nombre</Label><Input id="prod-nombre" aria-label="Nombre del producto" value={form.nombre} onInput={(e) => setForm({ ...form, nombre: (e.target as HTMLInputElement).value })} required /></div>
        <div class="grid grid-cols-2 gap-4"><div class="space-y-2"><Label for="prod-precio">Precio (MXN)</Label><Input id="prod-precio" type="number" step="0.01" aria-label="Precio" value={form.precio} onInput={(e) => setForm({ ...form, precio: (e.target as HTMLInputElement).value })} required /></div><div class="space-y-2"><Label for="prod-stock">Stock</Label><Input id="prod-stock" type="number" aria-label="Stock" value={form.stock} onInput={(e) => setForm({ ...form, stock: (e.target as HTMLInputElement).value })} required /></div></div>
        <div class="space-y-2"><Label for="prod-cat">Categoría</Label><select id="prod-cat" aria-label="Categoría" value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: (e.target as HTMLSelectElement).value })} required class="flex h-9 w-full rounded-sm border border-border bg-elevated px-3 text-sm"><option value="">Selecciona…</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
        <div class="space-y-2"><Label for="prod-img">Imagen</Label><div class="flex gap-3"><div class="h-20 w-20 border border-border bg-elevated">{form.imagen ? <img src={imgUrl(form.imagen)} alt="Vista previa" width={80} height={80} class="h-full w-full object-cover" /> : null}</div><div class="flex-1 space-y-2"><Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={subiendo}>{subiendo ? 'Subiendo…' : 'Subir'}</Button><input ref={ref} type="file" accept="image/*" class="hidden" onChange={onPick} aria-label="Subir imagen" /><Input id="prod-img" aria-label="URL de imagen" value={form.imagen} onInput={(e) => setForm({ ...form, imagen: (e.target as HTMLInputElement).value })} placeholder="URL" /></div></div></div>
        {error && <div class="border-l-2 border-destructive bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
        <div class="flex gap-2"><Button type="button" variant="outline" onClick={onClose} class="flex-1">Cancelar</Button><Button type="submit" disabled={enviando || subiendo} class="flex-1">{enviando ? 'Guardando…' : 'Guardar'}</Button></div>
      </form>
    </Dialog>
  );
}
