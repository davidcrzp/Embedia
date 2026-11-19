import { sql } from '../../db/client';
import { mapCategoria, mapProducto, mapUsuario, mapPedido, type Row } from '../../utils/mappers';
export const Categoria = {
  productos: async (c: Row, { limit, offset }: { limit: number; offset: number }) => (await sql`SELECT * FROM producto WHERE categoria_id = ${c.id} ORDER BY id LIMIT ${limit} OFFSET ${offset}`).map(mapProducto),
  totalProductos: async (c: Row) => { const [r] = await sql`SELECT COUNT(*)::int AS n FROM producto WHERE categoria_id = ${c.id}`; return Number(r?.n ?? 0); },
};
export const Producto = { categoria: async (p: Row) => { const [r] = await sql`SELECT * FROM categoria WHERE id = ${p.categoriaId}`; return r ? mapCategoria(r) : null; } };
export const Pedido = {
  usuario: async (p: Row) => { const [r] = await sql`SELECT * FROM usuario WHERE id = ${p.usuarioId}`; return r ? mapUsuario(r) : null; },
  detalles: async (p: Row) => { const rows = await sql`SELECT * FROM pedido_detalle WHERE pedido_id = ${p.id} ORDER BY id`; return rows.map((r: Row) => ({ id: String(r.id), cantidad: Number(r.cantidad), precio: Number(r.precio), productoId: String(r.producto_id) })); },
};
export const PedidoDetalle = { producto: async (d: Row) => { const [r] = await sql`SELECT * FROM producto WHERE id = ${d.productoId}`; return r ? mapProducto(r) : null; } };
export const Usuario = { pedidos: async (u: Row) => (await sql`SELECT * FROM pedido WHERE usuario_id = ${u.id} ORDER BY id DESC`).map(mapPedido) };
