import { useState } from 'preact/hooks';
import type { CartItem, OxxoTicket } from '../../lib/types';
import { formatPrecioMXN } from '../../lib/format';
import { Button } from '../../ui/button';
type AddressPayload = { direccion?: string | null; lat?: number | null; lng?: number | null };
type Props = { items: CartItem[]; amount: number; payerEmail: string; address?: AddressPayload | null; onSuccess: (r: OxxoTicket) => void; onError: (msg: string) => void; onClearError: () => void; };
export default function OxxoPaymentPanel({ items, amount, payerEmail, address = null, onSuccess, onError, onClearError }: Props) {
  const [generando, setGenerando] = useState(false);
  const generar = async () => {
    onClearError(); setGenerando(true);
    try {
      const res = await fetch('/api/checkout/process-oxxo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ items: items.map((i) => ({ id: i.producto.id, cantidad: i.cantidad })), payer: { email: payerEmail }, direccion: address?.direccion ?? null, lat: address?.lat ?? null, lng: address?.lng ?? null }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { onError(String(data?.error ?? 'No se pudo generar el ticket OXXO.')); return; }
      onSuccess(data as OxxoTicket);
    } catch (e: any) { onError(String(e?.message ?? 'No pudimos conectar con el servidor.')); }
    finally { setGenerando(false); }
  };
  return (
    <div class="rounded-md border border-border bg-surface p-6">
      <div class="mb-4 flex items-start gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-sm bg-primary/10 text-lg text-primary" aria-hidden="true">🏪</span>
        <div class="min-w-0">
          <p class="text-sm font-bold text-foreground">Pago en efectivo con OXXO</p>
          <p class="mt-1 text-xs leading-relaxed text-muted">Se generará un ticket con código de barras. Tu pedido quedará en estado <span class="text-primary font-semibold">PENDIENTE</span> hasta que el pago sea confirmado.</p>
        </div>
      </div>
      <ul class="mb-5 space-y-1.5 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-wider text-muted">
        <li class="flex justify-between"><span>Monto a pagar</span><span class="text-foreground">{formatPrecioMXN(amount)} MXN</span></li>
        <li class="flex justify-between"><span>Vigencia</span><span class="text-foreground">3 días naturales</span></li>
        <li class="flex justify-between"><span>Comisión</span><span class="text-foreground">Incluida</span></li>
      </ul>
      <div class="mb-4 border-l-2 border-primary/40 bg-primary/5 p-3 text-[11px] leading-relaxed text-muted">Al generar el ticket <span class="text-foreground">reservamos el stock</span> de tu pedido.</div>
      <Button onClick={generar} disabled={generando} class="w-full font-mono text-xs uppercase tracking-wider">{generando ? 'Generando ticket…' : 'Generar ticket OXXO'}</Button>
    </div>
  );
}
