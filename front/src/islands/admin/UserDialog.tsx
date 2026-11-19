import { useEffect, useState } from 'preact/hooks';
import { ApiError, gql } from '../../lib/api';
import { Dialog } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
type Props = { open: boolean; onClose: () => void; onSaved: () => void };
type FormState = { nombre: string; email: string; password: string; confirmPassword: string; rol: 'ADMIN' | 'CLIENTE' };
const EMPTY: FormState = { nombre: '', email: '', password: '', confirmPassword: '', rol: 'CLIENTE' };
export default function UserDialog({ open, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY); const [enviando, setEnviando] = useState(false); const [error, setError] = useState<string | null>(null); const [confirmTouched, setConfirmTouched] = useState(false);
  useEffect(() => { if (!open) return; setForm(EMPTY); setError(null); setConfirmTouched(false); }, [open]);
  const passwordsMatch = form.password === form.confirmPassword; const showMismatch = confirmTouched && form.confirmPassword.length > 0 && !passwordsMatch;
  const onSubmit = async (e: Event) => {
    e.preventDefault(); setError(null);
    if (!form.nombre.trim()) return setError('El nombre es obligatorio'); if (!form.email.includes('@')) return setError('Email inválido');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres'); if (!passwordsMatch) { setConfirmTouched(true); return setError('Las contraseñas no coinciden'); }
    setEnviando(true);
    try {
      await gql(`mutation C($input: UsuarioInput!) { crearUsuario(input: $input) { id nombre email rol } }`, { input: { nombre: form.nombre.trim(), email: form.email.trim().toLowerCase(), password: form.password, rol: form.rol } });
      onSaved(); onClose();
    } catch (e: any) { setError(e instanceof ApiError ? String(e.errors[0]?.message ?? 'Error') : String(e?.message ?? 'Error')); } finally { setEnviando(false); }
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={onSubmit} class="space-y-4">
        <h2 class="text-heading font-bold">Nuevo usuario</h2><p class="font-mono text-[10px] uppercase tracking-wider text-muted">Los mismos datos del registro + selección de rol</p>
        <div class="space-y-2"><Label for="user-nombre">Nombre</Label><Input id="user-nombre" aria-label="Nombre" value={form.nombre} onInput={(e) => setForm({ ...form, nombre: (e.target as HTMLInputElement).value })} required minLength={2} placeholder="Ej. Ana Pérez" /></div>
        <div class="space-y-2"><Label for="user-email">Email</Label><Input id="user-email" type="email" aria-label="Email" value={form.email} onInput={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })} required placeholder="usuario@embedia.com" /></div>
        <div class="space-y-2"><Label for="user-pwd">Contraseña</Label><Input id="user-pwd" type="password" aria-label="Contraseña" value={form.password} onInput={(e) => setForm({ ...form, password: (e.target as HTMLInputElement).value })} required minLength={6} /><p class="font-mono text-[10px] uppercase tracking-wider text-muted">Mínimo 6 caracteres</p></div>
        <div class="space-y-2"><Label for="user-pwd2">Confirmar contraseña</Label><Input id="user-pwd2" type="password" aria-label="Confirmar contraseña" value={form.confirmPassword} onInput={(e) => { setForm({ ...form, confirmPassword: (e.target as HTMLInputElement).value }); setConfirmTouched(true); }} required minLength={6} class={showMismatch ? 'border-destructive focus-visible:border-destructive' : passwordsMatch && form.confirmPassword.length > 0 ? 'border-success focus-visible:border-success' : ''} />{showMismatch && <p class="font-mono text-[10px] uppercase tracking-wider text-destructive">⚠ Las contraseñas no coinciden</p>}{!showMismatch && passwordsMatch && form.confirmPassword.length > 0 && <p class="font-mono text-[10px] uppercase tracking-wider text-success">✓ Las contraseñas coinciden</p>}</div>
        <div class="space-y-2"><Label>Rol</Label><div class="grid grid-cols-2 gap-px bg-border">{(['CLIENTE', 'ADMIN'] as const).map((r) => <button key={r} type="button" onClick={() => setForm({ ...form, rol: r })} class={form.rol === r ? 'bg-primary/10 p-3 text-left ring-1 ring-primary' : 'bg-background p-3 text-left hover:bg-surface'}><p class={`text-sm font-semibold ${form.rol === r ? 'text-primary' : 'text-foreground'}`}>{r}</p><p class="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">{r === 'ADMIN' ? 'Acceso al panel' : 'Solo compras'}</p></button>)}</div></div>
        {error && <div class="border-l-2 border-destructive bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
        <div class="flex gap-2"><Button type="button" variant="outline" onClick={onClose} class="flex-1">Cancelar</Button><Button type="submit" disabled={enviando || form.password !== form.confirmPassword || form.password.length < 6} class="flex-1">{enviando ? 'Creando…' : 'Crear usuario'}</Button></div>
      </form>
    </Dialog>
  );
}
