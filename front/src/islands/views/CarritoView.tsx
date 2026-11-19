import { cartItems, cartTotal, cartCount, removeFromCart } from '../../stores/cart';
import { irAHome, irAlCheckout } from '../../stores/flow';
import { imgUrl } from '../../lib/api';
import { formatPrecioDisplay } from '../../lib/format';
import { Button } from '../../ui/button';
import CurrencySelector from '../CurrencySelector';
import QuantityControl from '../QuantityControl';
export default function CarritoView() {
  const items = cartItems.value;
  const count = cartCount.value;
  const total = cartTotal.value;
  if (items.length === 0) {
    return (
      <section class="pt-8">
        <div class="mb-6 border-b border-border pb-4"><h2 class="text-heading font-bold">Carrito</h2></div>
        <div class="border border-border py-16 text-center">
          <p class="mb-2 font-mono text-xs uppercase tracking-wider text-muted">Vacío</p>
          <p class="mb-6 text-sm text-muted">Aún no has agregado productos.</p>
          <Button onClick={irAHome}>Ir al catálogo</Button>
        </div>
      </section>
    );
  }
  const totalDisplay = formatPrecioDisplay(total);
  return (
    <section class="pt-8">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <h2 class="text-heading font-bold">Carrito</h2>
        <div class="flex items-center gap-3"><CurrencySelector /><span class="font-mono text-xs text-muted">{String(items.length).padStart(2, '0')} {items.length === 1 ? 'producto' : 'productos'} · <span class="text-primary">{String(count).padStart(2, '0')}</span> unidades</span></div>
      </div>
      <div class="divide-y divide-border border-y border-border">
        {items.map((i) => {
          const lineTotal = formatPrecioDisplay(Number(i.producto.precio) * i.cantidad);
          const unitPrice = formatPrecioDisplay(i.producto.precio);
          return (
            <div key={i.producto.id} class="flex flex-wrap items-center gap-4 py-4 sm:gap-6">
              <div class="h-16 w-16 flex-shrink-0 overflow-hidden border border-border bg-elevated"><img src={imgUrl(i.producto.imagen)} alt={String(i.producto.nombre)} width={64} height={64} class="h-full w-full object-cover" loading="lazy" decoding="async" /></div>
              <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{String(i.producto.nombre)}</p><p class="mt-1 font-mono text-xs text-muted">{unitPrice.full} · {i.producto.stock} disp.</p></div>
              <QuantityControl item={i} />
              <span class="w-28 text-right font-mono text-base font-semibold text-primary">{lineTotal.text} <span class="text-[9px] uppercase text-muted">{lineTotal.code}</span></span>
              <button onClick={() => removeFromCart(i.producto.id)} aria-label={`Quitar ${i.producto.nombre}`} class="font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-destructive">Quitar</button>
            </div>
          );
        })}
      </div>
      <div class="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div><p class="mb-1 font-mono text-label uppercase text-muted">Total</p><p class="flex items-baseline gap-2"><span class="font-mono text-3xl font-bold text-primary">{totalDisplay.text}</span><span class="font-mono text-xs uppercase text-muted">{totalDisplay.code}</span></p><p class="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">El cobro se realizará en MXN al finalizar</p></div>
        <div class="flex gap-2"><Button variant="outline" onClick={irAHome} class="font-mono text-xs uppercase tracking-wider">Seguir</Button><Button onClick={irAlCheckout} class="font-mono text-xs uppercase tracking-wider">Checkout →</Button></div>
      </div>
    </section>
  );
}
