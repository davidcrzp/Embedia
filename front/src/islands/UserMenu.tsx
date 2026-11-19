import { useEffect, useRef, useState } from 'preact/hooks';
import { authLoading, bootstrapAuth, currentUser, logout } from '../stores/auth';
import { irAMisPedidos } from '../stores/flow';
import { Button } from '../ui/button';
import { cn } from '../ui/cn';

export default function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { setMounted(true); bootstrapAuth(); }, []);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  if (!mounted) return <div class="h-9 w-24" aria-hidden="true" />;
  if (authLoading.value) return <span class="font-mono text-xs text-muted">—</span>;

  const u = currentUser.value;
  if (!u) return (<a href="/login"><Button variant="ghost" size="sm" class="font-mono text-xs uppercase tracking-wider">Iniciar sesión</Button></a>);

  const go = (fn: () => void) => () => { setOpen(false); fn(); };
  return (
    <div ref={wrapperRef} class="relative">
      <div class="hidden items-center gap-3 md:flex">
        {u.rol === 'ADMIN' && (<a href="/admin"><Button variant="outline" size="sm" class="border-primary/40 font-mono text-xs uppercase tracking-wider text-primary hover:border-primary">Admin</Button></a>)}
        <div class="min-w-0 text-right">
          <p class="truncate text-xs font-medium leading-tight">{u.nombre}</p>
          <p class="truncate font-mono text-[10px] text-muted">{u.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} class="font-mono text-xs uppercase tracking-wider">Salir</Button>
      </div>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label="Menú de cuenta"
        class="flex items-center gap-2 rounded-sm border border-border bg-transparent px-2 py-1 text-left transition-colors hover:border-border-strong hover:bg-elevated md:hidden">
        <div class="min-w-0 max-w-[130px]">
          <p class="truncate text-xs font-medium leading-tight text-foreground">{u.nombre}</p>
          <p class="truncate font-mono text-[10px] leading-tight text-muted">{u.email}</p>
        </div>
        <span class={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')} aria-hidden="true">▾</span>
      </button>
      {open && (
        <div role="menu" class="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-sm border border-border-strong bg-surface shadow-xl md:hidden">
          <div class="border-b border-border px-4 py-3">
            <p class="truncate text-sm font-medium text-foreground">{u.nombre}</p>
            <p class="mt-0.5 truncate font-mono text-[10px] text-muted">{u.email}</p>
            <p class="mt-1 font-mono text-[10px] uppercase tracking-wider text-primary">{u.rol}</p>
          </div>
          <ul class="py-1">
            <li><button role="menuitem" type="button" onClick={go(() => { irAMisPedidos(); })} class="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-elevated"><span>Mis pedidos</span><span class="font-mono text-[10px] text-muted" aria-hidden="true">→</span></button></li>
            {u.rol === 'ADMIN' && (<li><a role="menuitem" href="/admin" onClick={() => setOpen(false)} class="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-primary transition-colors hover:bg-elevated"><span>Admin dashboard</span><span class="font-mono text-[10px]" aria-hidden="true">→</span></a></li>)}
          </ul>
          <div class="border-t border-border">
            <button role="menuitem" type="button" onClick={go(logout)} class="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10">
              <span>Salir</span><span class="font-mono text-[10px]" aria-hidden="true">↪</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
