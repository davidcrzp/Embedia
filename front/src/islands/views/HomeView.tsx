import { useEffect, useRef, useState } from 'preact/hooks';
import { gql, imgUrl, productImageSrcSet } from '../../lib/api';
import { abrirProductoModal, catalogVersion } from '../../stores/flow';
import { formatPrecioDisplay } from '../../lib/format';
import type { Producto } from '../../lib/types';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import CurrencySelector from '../CurrencySelector';

const PAGE_SIZE = 12;
let ssrConsumed = false;

export default function HomeView({ initialProductos }: { initialProductos?: Producto[] } = {}) {
  const initial = initialProductos ?? [];
  const bootstrap = !ssrConsumed && initial.length > 0;
  const [productos, setProductos] = useState<Producto[]>(bootstrap ? initial : []);
  const [offset, setOffset] = useState(bootstrap ? initial.length : 0);
  const [cargando, setCargando] = useState(!bootstrap);
  const [error, setError] = useState<string | null>(null);
  const [hayMas, setHayMas] = useState(bootstrap ? initial.length >= PAGE_SIZE : true);
  const centinelaRef = useRef<HTMLDivElement | null>(null);

  const cargarPagina = async (nuevoOffset: number) => {
    setCargando(true); setError(null);
    try {
      const data = await gql<{ productos: Producto[] }>(
        `query P($limit: Int!, $offset: Int!) { productos(limit: $limit, offset: $offset) { id nombre precio imagen stock categoria { id nombre } } }`,
        { limit: PAGE_SIZE, offset: nuevoOffset },
      );
      const nuevos = Array.isArray(data?.productos) ? data.productos : [];
      setProductos((prev) => (nuevoOffset === 0 ? nuevos : [...prev, ...nuevos]));
      setOffset(nuevoOffset + nuevos.length);
      if (nuevos.length < PAGE_SIZE) setHayMas(false);
    } catch (e: any) { setError(String(e?.message ?? 'Error al cargar')); }
    finally { setCargando(false); }
  };

  useEffect(() => {
    if (bootstrap) { ssrConsumed = true; return; }
    setProductos([]); setOffset(0); setHayMas(true);
    cargarPagina(0);
  }, [catalogVersion.value]);

  useEffect(() => {
    const el = centinelaRef.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
	  if (cargando || !hayMas) return;
	  cargarPagina(offset);
	}, { rootMargin: '400px 0px' });
	io.observe(el); return () => io.disconnect();
  }, [offset, cargando, hayMas]);

  return (
    <section class="pt-8">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <h2 class="text-heading font-bold">Catálogo</h2>
        <div class="flex items-center gap-3">
          <CurrencySelector />
          <span class="font-mono text-xs text-muted">{cargando && productos.length === 0 ? 'Cargando…' : `${String(productos.length).padStart(2, '0')} productos`}</span>
        </div>
      </div>
      {productos.length === 0 && cargando && (
        <div class="grid grid-cols-2 gap-px bg-border md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} class="space-y-3 bg-background p-4"><Skeleton class="aspect-square w-full" /><Skeleton class="h-3 w-3/4" /><Skeleton class="h-4 w-1/3" /></div>))}
        </div>
      )}
      {error && productos.length === 0 && (
        <div class="border border-destructive/40 bg-destructive/5 p-4 text-sm"><p class="mb-2 font-mono text-xs text-destructive">ERROR</p><p class="mb-3 text-muted">{error}</p><Button variant="outline" size="sm" onClick={() => cargarPagina(0)}>Reintentar</Button></div>
      )}
      {productos.length > 0 && (
        <div class="grid grid-cols-2 gap-px bg-border md:grid-cols-3 lg:grid-cols-4">
          {productos.map((p, idx) => {
            const first = idx === 0;
            const srcSet = productImageSrcSet(String(p.imagen ?? ''));
            const price = formatPrecioDisplay(p.precio);
            return (
              <article key={p.id} onClick={() => abrirProductoModal(p)} class="group flex cursor-pointer flex-col bg-background p-4 transition-colors hover:bg-surface">
                <div class="relative mb-4 aspect-square overflow-hidden bg-elevated">
                  <img src={imgUrl(p.imagen)} srcset={srcSet} sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" alt={String(p.nombre)} width={600} height={600} class="h-full w-full object-cover" loading={first ? 'eager' : 'lazy'} fetchpriority={first ? 'high' : 'auto'} decoding="async" />
                  {p.stock === 0 && (<div class="absolute inset-0 grid place-items-center bg-background/90"><Badge variant="destructive">Sin stock</Badge></div>)}
                </div>
                <div class="flex flex-1 flex-col">
                  {p.categoria && (<p class="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">{String(p.categoria.nombre)}</p>)}
                  <h3 class="mb-3 line-clamp-2 text-sm font-medium leading-snug">{String(p.nombre)}</h3>
                  <div class="mt-auto flex items-end justify-between border-t border-border pt-3">
                    <span class="flex items-baseline gap-1"><span class="font-mono text-base font-bold text-primary">{price.text}</span><span class="font-mono text-[9px] uppercase text-muted">{price.code}</span></span>
                    <span class="font-mono text-[10px] text-muted">{p.stock === 0 ? '—' : `×${String(p.stock).padStart(2, '0')}`}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div ref={centinelaRef} class="h-px w-full" />
      {cargando && productos.length > 0 && (<div class="flex items-center justify-center gap-3 py-8 font-mono text-xs uppercase tracking-wider text-muted"><span class="h-3 w-3 animate-spin rounded-full border border-border border-t-primary"></span>Cargando más…</div>)}
      {!hayMas && productos.length > 0 && (<div class="py-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted">— Fin del catálogo — ({productos.length} productos)</div>)}
    </section>
  );
}
