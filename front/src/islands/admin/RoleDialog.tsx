import { useEffect, useState } from 'preact/hooks';
import { gql } from '../../lib/api';
import { Dialog } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { AdminUser } from '../../lib/types';
export default function RoleDialog({ user, onClose, onSaved }: { user: AdminUser | null; onClose: () => void; onSaved: () => void }) {
  const [rol, setRol] = useState<'ADMIN' | 'CLIENTE'>('CLIENTE'); const [enviando, setEnviando] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (user) { setRol(user.rol); setError(null); } }, [user?.id]);
  if (!user) return null;
  const onSubmit = async (e: Event) => {
    e.preventDefault(); setError(null); if (rol === user.rol) return setError('Selecciona otro rol');
    setEnviando(true);
    try { await gql(`mutation R($id: ID!, $rol: Rol!) { cambiarRolUsuario(id: $id, rol: $rol) { id } }`, { id: user.id, rol }); onSaved(); onClose(); } catch (e: any) { setError(String(e?.message ?? 'Error')); } finally { setEnviando(false); }
  };
  return (
    <Dialog open={!!user} onClose={onClose}>
      <form onSubmit={onSubmit} class="space-y-4">
        <h2 class="text-heading font-bold">Cambiar rol</h2><p class="font-mono text-xs text-muted">{user.email}</p>
        <div class="flex gap-2"><Badge variant={user.rol === 'ADMIN' ? 'default' : 'muted'}>{user.rol}</Badge></div>
        <fieldset class="grid gap-2"><legend class="sr-only">Nuevo rol</legend>{(['CLIENTE', 'ADMIN'] as const).map((r) => <label key={r} class={rol === r ? 'flex gap-3 border border-primary bg-primary/5 p-3 rounded-sm cursor-pointer' : 'flex gap-3 border border-border p-3 rounded-sm cursor-pointer'}><input type="radio" name="rol" checked={rol === r} onChange={() => setRol(r)} class="mt-1" aria-label={r} /><div><p class="text-sm font-semibold">{r}</p></div></label>)}</fieldset>
        {error && <div class="border-l-2 border-destructive bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
        <div class="flex gap-2"><Button type="button" variant="outline" onClick={onClose} class="flex-1">Cancelar</Button><Button type="submit" disabled={enviando} class="flex-1">Cambiar</Button></div>
      </form>
    </Dialog>
  );
}
