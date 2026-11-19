import { useEffect, useState } from 'preact/hooks';
import { ApiError, gql } from '../../lib/api';
import { Dialog } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import type { AdminCategoria } from './AdminCategories';
type Props = { open: boolean; onClose: () => void; onSaved: () => void; categoria: AdminCategoria | null };
export default function CategoryDialog({ open, onClose, onSaved, categoria }: Props) {
  const [nombre, setNombre] = useState(''); const [enviando, setEnviando] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setNombre(categoria?.nombre ?? ''); setError(null); } }, [open, categoria?.id]);
  const onSubmit = async (e: Event) => {
    e.preventDefault(); setError(null); const n = nombre.trim(); if (!n) return setError('Nombre obligatorio');
    setEnviando(true);
    try {
      if (categoria) await gql(`mutation U($id: ID!, $input: CategoriaInput!) { actualizarCategoria(id: $id, input: $input) { id } }`, { id: categoria.id, input: { nombre: n } });
      else await gql(`mutation C($input: CategoriaInput!) { crearCategoria(input: $input) { id } }`, { input: { nombre: n } });
      onSaved(); onClose();
    } catch (e: any) { setError(e instanceof ApiError ? String(e.errors[0]?.message) : String(e?.message ?? 'Error')); } finally { setEnviando(false); }
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={onSubmit} class="space-y-4">
        <h2 class="text-heading font-bold">{categoria ? 'Editar' : 'Nueva categoría'}</h2>
        <div class="space-y-2"><Label for="cat-nombre">Nombre</Label><Input id="cat-nombre" aria-label="Nombre de la categoría" value={nombre} onInput={(e) => setNombre((e.target as HTMLInputElement).value)} required maxLength={40} /></div>
        {error && <div class="border-l-2 border-destructive bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
        <div class="flex gap-2"><Button type="button" variant="outline" onClick={onClose} class="flex-1">Cancelar</Button><Button type="submit" disabled={enviando} class="flex-1">Guardar</Button></div>
      </form>
    </Dialog>
  );
}
