import { updateCartQuantity } from '../stores/cart';
import { Input } from '../ui/input';
import type { CartItem } from '../lib/types';
export default function QuantityControl({ item }: { item: CartItem }) {
  const max = Math.max(1, Math.floor(Number(item.producto.stock) || 1));
  const atMin = item.cantidad <= 1; const atMax = item.cantidad >= max;
  const setQty = (n: number) => updateCartQuantity(item.producto.id, n);
  const handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement; const raw = input.value; if (raw === '') return;
    const num = Number(raw); if (!Number.isFinite(num)) { input.value = String(item.cantidad); return; }
    let next = Math.floor(num); if (next < 1) next = 1; if (next > max) next = max;
    if (String(next) !== raw) input.value = String(next); setQty(next);
  };
  return (
    <div class="flex flex-col items-end gap-1">
      <div class="flex items-center gap-1">
        <button type="button" onClick={() => setQty(item.cantidad - 1)} disabled={atMin} aria-label="Disminuir cantidad" class="grid h-8 w-8 place-items-center rounded-sm border border-border font-mono text-sm text-foreground transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30">−</button>
        <Input type="number" min={1} max={max} step={1} value={item.cantidad} onInput={handleInput} aria-label="Cantidad" class="h-8 w-14 rounded-sm px-1 text-center font-mono" />
        <button type="button" onClick={() => setQty(item.cantidad + 1)} disabled={atMax} aria-label="Aumentar cantidad" class="grid h-8 w-8 place-items-center rounded-sm border border-border font-mono text-sm text-foreground transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30">+</button>
      </div>
      {atMax && <span class="font-mono text-[10px] uppercase tracking-wider text-muted">Máx. {max} uds.</span>}
    </div>
  );
}
