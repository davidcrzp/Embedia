import { useEffect, useState } from 'preact/hooks';
import { cartCount } from '../stores/cart';
import { irAlCarrito } from '../stores/flow';
import { Button } from '../ui/button';

export default function CartBadge() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const count = mounted ? cartCount.value : 0;
  return (
    <Button variant="outline" size="sm" onClick={irAlCarrito} class="gap-2 font-mono" aria-label={`Carrito (${count} artículos)`}>
      <span class="hidden sm:inline">Carrito</span>
      <span class="sm:hidden" aria-hidden="true">🛒</span>
      <span class="text-primary">{count}</span>
    </Button>
  );
}
