import { useEffect, useState } from 'preact/hooks';
import { authMe } from '../lib/api';
import { iniciarTiempoReal } from '../lib/realtime';
import AdminStats from './admin/AdminStats';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminCategories from './admin/AdminCategories';
import AdminUsers from './admin/AdminUsers';
type Tab = 'resumen' | 'pedidos' | 'productos' | 'categorias' | 'usuarios';
const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' }, { id: 'pedidos', label: 'Pedidos' },
  { id: 'productos', label: 'Productos' }, { id: 'categorias', label: 'Categorías' },
  { id: 'usuarios', label: 'Usuarios' },
];
export default function AdminApp() {
  const [tab, setTab] = useState<Tab>('resumen');
  const [estado, setEstado] = useState<'validando' | 'ok' | 'denegado'>('validando');
  useEffect(() => {
    let cancel = false;
    (async () => {
      const u = await authMe();
      if (cancel) return;
      if (!u || u.rol !== 'ADMIN') { setEstado('denegado'); window.location.href = '/'; return; }
      setEstado('ok');
    })();
    return () => { cancel = true; };
  }, []);
  useEffect(() => { if (estado !== 'ok') return; return iniciarTiempoReal(); }, [estado]);
  if (estado === 'validando') return <div class="flex items-center gap-3 py-8 font-mono text-xs uppercase tracking-wider text-muted"><span class="h-3 w-3 animate-spin rounded-full border border-border border-t-primary" />Verificando credenciales…</div>;
  if (estado === 'denegado') return <div class="border-l-2 border-destructive bg-destructive/5 p-4 text-sm"><p class="font-mono text-xs uppercase text-destructive">Acceso denegado</p><p class="mt-1 text-muted">Redirigiendo…</p></div>;
  return (
    <div class="pt-6">
      <nav aria-label="Secciones del panel" class="mb-8 flex flex-wrap border-b border-border">{TABS.map((t) => <button key={t.id} onClick={() => setTab(t.id)} class={tab === t.id ? 'border-b-2 border-primary px-4 pb-3 text-sm font-medium text-foreground' : 'border-b-2 border-transparent px-4 pb-3 text-sm font-medium text-muted transition-colors hover:text-foreground'}>{t.label}</button>)}</nav>
      {tab === 'resumen' && <AdminStats onVerPedidos={() => setTab('pedidos')} />}
      {tab === 'pedidos' && <AdminOrders />}
      {tab === 'productos' && <AdminProducts />}
      {tab === 'categorias' && <AdminCategories />}
      {tab === 'usuarios' && <AdminUsers />}
    </div>
  );
}
