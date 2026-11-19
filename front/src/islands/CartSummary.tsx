import { cartCount, cartTotal } from '../stores/cart';
import { formatPrecioDisplay } from '../lib/format';
export default function CartSummary() {
  const total = formatPrecioDisplay(cartTotal.value);
  return (
    <div class="space-y-3 font-mono text-sm">
      <div class="flex justify-between"><span class="text-muted">Productos</span><span class="text-primary">{String(cartCount.value).padStart(2, '0')}</span></div>
      <div class="flex items-baseline justify-between border-t border-border pt-3">
        <span class="text-muted">Total</span>
        <span class="flex items-baseline gap-1"><span class="font-semibold text-primary">{total.text}</span><span class="text-[9px] uppercase text-muted">{total.code}</span></span>
      </div>
    </div>
  );
}
