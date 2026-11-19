import { useEffect, useState } from 'preact/hooks';
import { ApiError, gql } from '../../lib/api';
import { currentUser } from '../../stores/auth';
import type { AdminUser } from '../../lib/types';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import PasswordDialog from './PasswordDialog';
import RoleDialog from './RoleDialog';
import UserDialog from './UserDialog';
export default function AdminUsers() {
  const me = currentUser.value;
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]); const [cargando, setCargando] = useState(true); const [error, setError] = useState<string | null>(null);
  const [pwdUser, setPwdUser] = useState<AdminUser | null>(null); const [roleUser, setRoleUser] = useState<AdminUser | null>(null); const [newOpen, setNewOpen] = useState(false);
  const cargar = async () => {
    setCargando(true); setError(null);
    try { const d = await gql<any>(`query { usuarios { id nombre email rol pedidos { id } } }`); setUsuarios(Array.isArray(d?.usuarios) ? d.usuarios : []); }
    catch (e: any) { setError(String(e?.message ?? 'Error')); } finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);
  const eliminar = async (u: AdminUser) => {
    if (me?.id === u.id) return alert('No puedes eliminarte');
    if (!confirm(`¿Eliminar a ${u.nombre}?`)) return;
    try { await gql(`mutation D($id: ID!) { eliminarUsuario(id: $id) }`, { id: u.id }); await cargar(); } catch (e: any) { alert(e instanceof ApiError ? e.errors[0]?.message : e.message); }
  };
  if (cargando) return <div class="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} class="h-8 w-full" />)}</div>;
  if (error) return <div class="border border-destructive/40 bg-destructive/5 p-4 text-sm">{error}</div>;
  return (
    <div>
      <div class="mb-4 flex items-center justify-between gap-4"><span class="font-mono text-xs text-muted">{usuarios.length} usuarios</span><Button onClick={() => setNewOpen(true)} class="font-mono text-xs uppercase tracking-wider">+ Nuevo usuario</Button></div>
      <div class="divide-y divide-border">{usuarios.map((u) => <div key={u.id} class="grid grid-cols-[1fr_1fr_90px_70px_320px] items-center gap-4 py-3"><div class="truncate text-sm">{u.nombre} {me?.id === u.id && <span class="text-primary text-[10px]">(tú)</span>}</div><span class="truncate font-mono text-xs text-muted">{u.email}</span><Badge variant={u.rol === 'ADMIN' ? 'default' : 'muted'}>{u.rol}</Badge><span class="font-mono text-xs text-muted">{u.pedidos?.length ?? 0}</span><div class="flex flex-wrap justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setRoleUser(u)} disabled={me?.id === u.id}>Rol</Button><Button variant="outline" size="sm" onClick={() => setPwdUser(u)}>Contraseña</Button><Button variant="ghost" size="sm" onClick={() => eliminar(u)} disabled={me?.id === u.id} aria-label={`Eliminar ${u.nombre}`} class="text-destructive">×</Button></div></div>)}</div>
      <PasswordDialog user={pwdUser} onClose={() => setPwdUser(null)} />
      <RoleDialog user={roleUser} onClose={() => setRoleUser(null)} onSaved={cargar} />
      <UserDialog open={newOpen} onClose={() => setNewOpen(false)} onSaved={cargar} />
    </div>
  );
}
