import { useEffect, lazy, Suspense } from 'preact/compat';
import { view } from '../stores/flow';
import { bootstrapAuth } from '../stores/auth';
import { initCurrency } from '../lib/currency';
import HomeView from './views/HomeView';
import type { Producto } from '../lib/types';

// Carga diferida: estas vistas solo se montan cuando el usuario navega a ellas.
const CategoriaView = lazy(() => import('./views/CategoriaView'));
const CarritoView  = lazy(() => import('./views/CarritoView'));
const CheckoutView = lazy(() => import('./views/CheckoutView'));
const PedidosView  = lazy(() => import('./views/PedidosView'));
const ProductModal = lazy(() => import('./ProductModal'));

const Fallback = () => (
  <div class="flex items-center justify-center gap-3 py-16 font-mono text-xs uppercase tracking-wider text-muted">
    <span class="h-3 w-3 animate-spin rounded-full border border-border border-t-primary" />
    Cargando…
  </div>
);

export default function ShopApp({ initialProductos }: { initialProductos?: Producto[] } = {}) {
  const v = view.value;
  useEffect(() => { bootstrapAuth(); initCurrency(); }, []);
  useEffect(() => {
    const wrap = document.getElementById('hero-wrap');
    if (wrap) (wrap as HTMLElement).hidden = v !== 'home';
  }, [v]);
  return (
    <>
      {v === 'home' && <HomeView initialProductos={initialProductos} />}
      {v !== 'home' && (
        <Suspense fallback={<Fallback />}>
          {v === 'categoria' && <CategoriaView />}
          {v === 'carrito' && <CarritoView />}
          {v === 'checkout' && <CheckoutView />}
          {v === 'pedidos' && <PedidosView />}
        </Suspense>
      )}
      <Suspense fallback={null}><ProductModal /></Suspense>
    </>
  );
}
