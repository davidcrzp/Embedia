import { createPubSub } from 'graphql-yoga';
import { sql } from '../db/client';
import { mapPedido, mapProducto } from '../utils/mappers';
export type PedidoCreadoEvento = { pedido: ReturnType<typeof mapPedido>; productos: ReturnType<typeof mapProducto>[]; };
export const pubSub = createPubSub<{ pedidoCreado: [PedidoCreadoEvento] }>();
let suscriptores = 0;
export async function* suscribirPedidoCreado(): AsyncGenerator<PedidoCreadoEvento> {
  suscriptores++;
  console.log(`[realtime] 🔌 admin suscrito (activos: ${suscriptores})`);
  try { yield* pubSub.subscribe('pedidoCreado'); }
  finally { suscriptores--; console.log(`[realtime] ❌ admin desconectado (activos: ${suscriptores})`); }
}
let cola: Promise<void> = Promise.resolve();
export function publicarPedidoCreado(pedidoId: number): Promise<void> {
  cola = cola.then(async () => {
    try {
      const [p] = await sql`SELECT * FROM pedido WHERE id = ${pedidoId}`;
      if (!p) return;
      const productos = await sql`SELECT * FROM producto WHERE id IN (SELECT producto_id FROM pedido_detalle WHERE pedido_id = ${pedidoId}) ORDER BY id`;
      pubSub.publish('pedidoCreado', { pedido: mapPedido(p), productos: productos.map(mapProducto) });
      console.log(`[realtime] 📣 pedido #${pedidoId} publicado a ${suscriptores} admin(s)`);
    } catch (e) { console.error('[realtime] No se pudo publicar pedidoCreado:', e); }
  });
  return cola;
}
