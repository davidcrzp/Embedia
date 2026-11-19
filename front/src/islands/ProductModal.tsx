import { useEffect, useState } from 'preact/hooks';
import { cartItems, addToCart } from '../stores/cart';
import { productoModal, irAlCarrito } from '../stores/flow';
import { imgUrl } from '../lib/api';
import { formatPrecioDisplay } from '../lib/format';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
export default function ProductModal() {
  const p = productoModal.value;
  const [cantidad, setCantidad] = useState(1);
  const enCarrito = p ? cartItems.value.find((i) => i.producto.id === p.id)?.cantidad ?? 0 : 0;
  const disponible = p ? Math.max(0, p.stock) : 0; const agotado = disponible === 0; const max = Math.max(1, disponible);
  useEffect(() => { setCantidad(1); }, [p?.id]);
  useEffect(() => { if (disponible > 0 && cantidad > disponible) setCantidad(disponible); }, [disponible]);
  if (!p) return null;
  const cerrar = () => { productoModal.value = null; };
  const agregar = () => { if (agotado) return; const copia = { ...p, categoria: p.categoria ? { ...p.categoria } : undefined }; addToCart(copia, Math.min(Math.max(1, cantidad), max)); cerrar(); irAlCarrito(); };
  const handleCantidadInput = (e: Event) => {
    const input = e.target as HTMLInputElement; const raw = input.value; if (raw === '') return;
    const num = Number(raw); if (!Number.isFinite(num)) { input.value = String(cantidad); return; }
    let next = Math.floor(num); if (next < 1) next = 1; if (next > max) next = max;
    if (String(next) !== raw) input.value = String(next); setCantidad(next);
  };
  const price = formatPrecioDisplay(p.precio);
  const subtotal = formatPrecioDisplay(Number(p.precio) * Math.min(Math.max(1, cantidad), max));
  return (
    <Dialog open={!!p} onClose={cerrar}>
      <div class="mb-5 flex items-start justify-between gap-4"><div><p class="mb-1 text-label font-mono uppercase text-muted">SKU-{String(p.id).padStart(5, '0')}</p><h2 class="text-heading font-bold leading-tight">{String(p.nombre)}</h2></div><button onClick={cerrar} aria-label="Cerrar" class="font-mono text-muted transition-colors hover:text-foreground">[esc]</button></div>
      <div class="mb-5 overflow-hidden rounded-sm border border-border bg-elevated"><img src={imgUrl(p.imagen)} alt={String(p.nombre)} width={600} height={224} class="h-56 w-full object-cover" loading="lazy" decoding="async" /></div>
      <div class="mb-5 flex items-end justify-between border-y border-border py-4"><div><p class="mb-1 text-label font-mono uppercase text-muted">Precio</p><p class="flex items-baseline gap-2"><span class="font-mono text-3xl font-bold text-primary">{price.text}</span><span class="font-mono text-xs uppercase text-muted">{price.code}</span></p></div><div class="text-right"><p class="mb-1 text-label font-mono uppercase text-muted">Stock</p><p class={`font-mono text-sm font-semibold ${agotado ? 'text-destructive' : 'text-foreground'}`}>{agotado ? 'AGOTADO' : String(disponible).padStart(2, '0') + ' uds.'}</p></div></div>
      <div class="mb-5 flex items-center gap-4"><div><label for="modal-cantidad" class="mb-1 block text-label font-mono uppercase text-muted">Cantidad</label><Input id="modal-cantidad" type="number" min={1} max={max} step={1} value={cantidad} disabled={agotado} class="w-24 text-center font-mono" onInput={handleCantidadInput} /></div><div class="flex-1 text-right"><p class="mb-1 text-label font-mono uppercase text-muted">Subtotal</p><p class="font-mono text-lg font-bold">{subtotal.text} <span class="text-[10px] uppercase text-muted">{subtotal.code}</span></p></div></div>
      {enCarrito > 0 && <p class="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">Ya tienes {enCarrito} en el carrito</p>}
      <div class="flex gap-2"><Button variant="outline" onClick={cerrar} class="flex-1 font-mono text-xs uppercase tracking-wider">Cancelar</Button><Button onClick={agregar} disabled={agotado} class="flex-1 font-mono text-xs uppercase tracking-wider">{agotado ? 'Sin stock' : 'Añadir'}</Button></div>
    </Dialog>
  );
}
