import { useEffect, useState } from 'preact/hooks';
import { gql } from '../../lib/api';
import { Dialog } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import type { AdminUser } from '../../lib/types';
export default function PasswordDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const [pwd, setPwd] = useState(''); const [confirm, setConfirm] = useState(''); const [enviando, setEnviando] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (user) { setPwd(''); setConfirm(''); setError(null); } }, [user?.id]);
  if (!user) return null;
  const onSubmit = async (e: Event) => {
    e.preventDefault(); setError(null); if (pwd.length < 6) return setError('Mínimo 6 caracteres'); if (pwd !== confirm) return setError('No coinciden');
    setEnviando(true);
    try { await gql(`mutation P($id: ID!, $newPassword: String!) { cambiarPasswordUsuario(id: $id, newPassword: $newPassword) }`, { id: user.id, newPassword: pwd }); onClose(); } catch (e: any) { setError(String(e?.message ?? 'Error')); } finally { setEnviando(false); }
  };
  return (
    <Dialog open={!!user} onClose={onClose}>
      <form onSubmit={onSubmit} class="space-y-4">
        <h2 class="text-heading font-bold">Cambiar contraseña</h2><p class="font-mono text-xs text-muted">{user.email}</p>
        <div class="space-y-2"><Label for="pwd-nueva">Nueva</Label><Input id="pwd-nueva" aria-label="Nueva contraseña" type="password" value={pwd} onInput={(e) => setPwd((e.target as HTMLInputElement).value)} required minLength={6} /></div>
        <div class="space-y-2"><Label for="pwd-confirmar">Confirmar</Label><Input id="pwd-confirmar" aria-label="Confirmar contraseña" type="password" value={confirm} onInput={(e) => setConfirm((e.target as HTMLInputElement).value)} required minLength={6} /></div>
        {error && <div class="border-l-2 border-destructive bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
        <div class="flex gap-2"><Button type="button" variant="outline" onClick={onClose} class="flex-1">Cancelar</Button><Button type="submit" disabled={enviando} class="flex-1">Guardar</Button></div>
      </form>
    </Dialog>
  );
}
