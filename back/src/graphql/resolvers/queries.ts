import { sql } from '../../db/client';
import { mapCategoria, mapProducto, mapPedido, mapUsuario } from '../../utils/mappers';
import type { Context } from '../context';
import { requireAdmin, requireAuth } from './helpers';
export const Query = {
  categorias: async () => (await sql`SELECT * FROM categoria ORDER BY id`).map(mapCategoria),
  categoria: async (_: unknown, { id }: { id: string }) => { const [r] = await sql`SELECT * FROM categoria WHERE id = ${id}`; return r ? mapCategoria(r) : null; },
  productos: async (_: unknown, { limit, offset }: { limit: number; offset: number }) => (await sql`SELECT * FROM producto ORDER BY id LIMIT ${limit} OFFSET ${offset}`).map(mapProducto),
  producto: async (_: unknown, { id }: { id: string }) => { const [r] = await sql`SELECT * FROM producto WHERE id = ${id}`; return r ? mapProducto(r) : null; },
  misPedidos: async (_: unknown, _a: unknown, ctx: Context) => { const u = requireAuth(ctx); return (await sql`SELECT * FROM pedido WHERE usuario_id = ${u.sub} ORDER BY id DESC`).map(mapPedido); },
  pedidos: async (_: unknown, _a: unknown, ctx: Context) => {
    const u = requireAuth(ctx);
    if (u.rol === 'ADMIN') return (await sql`SELECT * FROM pedido ORDER BY id DESC`).map(mapPedido);
    return (await sql`SELECT * FROM pedido WHERE usuario_id = ${u.sub} ORDER BY id DESC`).map(mapPedido);
  },
  usuarios: async (_: unknown, _a: unknown, ctx: Context) => { requireAdmin(ctx); return (await sql`SELECT * FROM usuario ORDER BY id`).map(mapUsuario); },
  me: async (_: unknown, _a: unknown, ctx: Context) => { const u = requireAuth(ctx); const [r] = await sql`SELECT * FROM usuario WHERE id = ${u.sub}`; return r ? mapUsuario(r) : null; },
};
