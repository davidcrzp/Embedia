import { useEffect, useState } from 'preact/hooks';
import { bootstrapAuth, currentUser, login, registrar } from '../stores/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
type Modo = 'login' | 'registro';
export default function LoginForm() {
  const [modo, setModo] = useState<Modo>('login');
  const [nombre, setNombre] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [enviando, setEnviando] = useState(false); const [error, setError] = useState<string | null>(null);
  const [confirmTouched, setConfirmTouched] = useState(false);
  useEffect(() => { bootstrapAuth(); }, []);
  useEffect(() => { if (currentUser.value) window.location.href = '/'; }, [currentUser.value]);
  const passwordsMatch = password === confirmPassword;
  const showMismatch = modo === 'registro' && confirmTouched && confirmPassword.length > 0 && !passwordsMatch;
  const cambiarModo = (nuevo: Modo) => { setModo(nuevo); setError(null); setConfirmPassword(''); setConfirmTouched(false); };
  const onSubmit = async (e: Event) => {
    e.preventDefault(); setError(null);
    if (modo === 'registro') { if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres'); if (password !== confirmPassword) { setConfirmTouched(true); return setError('Las contraseñas no coinciden'); } }
    setEnviando(true);
    try { if (modo === 'login') await login(email, password); else await registrar(nombre, email, password); window.location.href = '/'; }
    catch (err: any) { setError(String(err?.message ?? 'Error')); } finally { setEnviando(false); }
  };
  return (
    <div class="min-h-screen bg-background">
      <div class="border-b border-border"><div class="mx-auto flex h-14 max-w-[1400px] items-center px-6"><a href="/" class="flex items-center gap-3"><span class="grid h-7 w-7 place-items-center rounded-sm bg-primary font-mono text-xs font-bold text-primary-foreground" aria-hidden="true">E</span><span class="text-sm font-bold uppercase tracking-[0.15em]">Embedia</span></a></div></div>
      <main id="main" class="mx-auto grid max-w-[1400px] grid-cols-1 gap-px bg-border px-6 py-16 lg:grid-cols-[1fr_480px]">
        <div class="hidden bg-background p-12 lg:block"><p class="mb-4 font-mono text-label uppercase text-primary">● Acceso</p><h1 class="mb-6 text-display font-extrabold">Tu cuenta en<br />Embedia</h1><p class="max-w-md text-base leading-relaxed text-muted">Accede a tu historial de pedidos, gestiona tus compras y recibe soporte técnico.</p><ul class="mt-10 space-y-3 border-t border-border pt-6 font-mono text-xs uppercase text-muted"><li class="flex justify-between border-b border-border py-2"><span>Catálogo</span><span class="text-foreground">48 productos</span></li><li class="flex justify-between border-b border-border py-2"><span>Envío</span><span class="text-foreground">Gratis +$100</span></li><li class="flex justify-between py-2"><span>Pago</span><span class="text-foreground">Tarjeta · OXXO</span></li></ul></div>
        <div class="bg-background p-8 lg:p-12">
          <div class="mb-8 flex border-b border-border"><button type="button" onClick={() => cambiarModo('login')} class={modo === 'login' ? 'border-b-2 border-primary px-4 pb-3 text-sm font-medium text-foreground' : 'border-b-2 border-transparent px-4 pb-3 text-sm font-medium text-muted hover:text-foreground'}>Iniciar sesión</button><button type="button" onClick={() => cambiarModo('registro')} class={modo === 'registro' ? 'border-b-2 border-primary px-4 pb-3 text-sm font-medium text-foreground' : 'border-b-2 border-transparent px-4 pb-3 text-sm font-medium text-muted hover:text-foreground'}>Registrarme</button></div>
          <form onSubmit={onSubmit} class="space-y-5">
            {modo === 'registro' && <div class="space-y-2"><Label for="nombre">Nombre</Label><Input id="nombre" type="text" value={nombre} onInput={(e) => setNombre((e.target as HTMLInputElement).value)} required minLength={2} /></div>}
            <div class="space-y-2"><Label for="email">Email</Label><Input id="email" type="email" value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} required /></div>
            <div class="space-y-2"><Label for="password">Contraseña</Label><Input id="password" type="password" value={password} onInput={(e) => setPassword((e.target as HTMLInputElement).value)} required minLength={6} />{modo === 'registro' && <p class="font-mono text-[10px] uppercase tracking-wider text-muted">Mínimo 6 caracteres</p>}</div>
            {modo === 'registro' && <div class="space-y-2"><Label for="confirmPassword">Confirmar contraseña</Label><Input id="confirmPassword" type="password" value={confirmPassword} onInput={(e) => { setConfirmPassword((e.target as HTMLInputElement).value); setConfirmTouched(true); }} required minLength={6} class={showMismatch ? 'border-destructive focus-visible:border-destructive' : passwordsMatch && confirmPassword.length > 0 ? 'border-success focus-visible:border-success' : ''} />{showMismatch && <p class="font-mono text-[10px] uppercase tracking-wider text-destructive">⚠ Las contraseñas no coinciden</p>}{!showMismatch && passwordsMatch && confirmPassword.length > 0 && <p class="font-mono text-[10px] uppercase tracking-wider text-success">✓ Las contraseñas coinciden</p>}</div>}
            {error && <div class="border-l-2 border-destructive bg-destructive/5 p-3 text-sm"><p class="font-mono text-xs uppercase text-destructive">Error</p><p class="mt-1 text-muted">{error}</p></div>}
            <Button type="submit" class="w-full font-mono text-xs uppercase tracking-wider" disabled={enviando || (modo === 'registro' && (password !== confirmPassword || password.length < 6))}>{enviando ? 'Procesando…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}</Button>
          </form>
          <div class="mt-8 border-t border-border pt-6"><p class="mb-2 font-mono text-label uppercase text-muted">Demo</p><p class="font-mono text-xs text-muted">cliente@embedia.com · cliente1234</p><p class="font-mono text-xs text-muted">admin@embedia.com · admin1234</p></div>
        </div>
      </main>
    </div>
  );
}
