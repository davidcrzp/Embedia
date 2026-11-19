import { GraphQLError } from 'graphql';
import { sql } from '../../db/client';
import { firmarToken } from '../../auth/jwt';
import { hashPassword, verifyPassword } from '../../auth/password';
import { mapCategoria, mapProducto, mapPedido, mapUsuario, type Row } from '../../utils/mappers';
import type { Context } from '../context';
import { requireAdmin } from './helpers';
const ESTADOS_VALIDOS = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'COMPLETADO', 'CANCELADO'] as const;
const ROLES_VALIDOS = ['ADMIN', 'CLIENTE'] as const;
export const Mutation = {
  registrar: async (_: unknown, { input }: Row) => {
    const nombre = String(input?.nombre ?? '').trim(); const email = String(input?.email ?? '').toLowerCase(); const password = String(input?.password ?? '');
    if (!nombre) throw new GraphQLError('El nombre es obligatorio', { extensions: { code: 'BAD_USER_INPUT' } });
    if (!email.includes('@')) throw new GraphQLError('Email inválido', { extensions: { code: 'BAD_USER_INPUT' } });
    if (password.length < 6) throw new GraphQLError('Contraseña mínima de 6 caracteres', { extensions: { code: 'BAD_USER_INPUT' } });
    const [existe] = await sql`SELECT id FROM usuario WHERE email = ${email}`;
    if (existe) throw new GraphQLError('Ya existe un usuario con ese email', { extensions: { code: 'CONFLICT' } });
    const hash = await hashPassword(password);
    const [row] = await sql`INSERT INTO usuario (nombre, email, password, rol) VALUES (${nombre}, ${email}, ${hash}, 'CLIENTE') RETURNING *`;
    const usuario = mapUsuario(row); const token = await firmarToken({ sub: usuario.id, email: usuario.email, rol: usuario.rol as any });
    return { token, usuario };
  },
  login: async (_: unknown, { input }: Row) => {
    const email = String(input?.email ?? '').toLowerCase(); const password = String(input?.password ?? '');
    const [row] = await sql`SELECT * FROM usuario WHERE email = ${email}`;
    if (!row || !row.password) throw new GraphQLError('Credenciales inválidas', { extensions: { code: 'UNAUTHENTICATED' } });
    if (!(await verifyPassword(password, row.password))) throw new GraphQLError('Credenciales inválidas', { extensions: { code: 'UNAUTHENTICATED' } });
    const usuario = mapUsuario(row); const token = await firmarToken({ sub: usuario.id, email: usuario.email, rol: usuario.rol as any });
    return { token, usuario };
  },
  crearProducto: async (_: unknown, { input }: Row, ctx: Context) => { requireAdmin(ctx); const [r] = await sql`INSERT INTO producto (nombre, precio, imagen, stock, categoria_id) VALUES (${String(input.nombre)}, ${Number(input.precio)}, ${input.imagen ?? null}, ${Number(input.stock)}, ${String(input.categoriaId)}) RETURNING *`; return mapProducto(r); },
  actualizarProducto: async (_: unknown, { id, input }: Row, ctx: Context) => { requireAdmin(ctx); const [prev] = await sql`SELECT * FROM producto WHERE id = ${id}`; if (!prev) return null; const [r] = await sql`UPDATE producto SET nombre = ${input.nombre ?? prev.nombre}, precio = ${input.precio ?? prev.precio}, imagen = ${input.imagen ?? prev.imagen}, stock = ${input.stock ?? prev.stock}, categoria_id = ${input.categoriaId ?? prev.categoria_id} WHERE id = ${id} RETURNING *`; return mapProducto(r); },
  eliminarProducto: async (_: unknown, { id }: { id: string }, ctx: Context) => { requireAdmin(ctx); try { const r = await sql`DELETE FROM producto WHERE id = ${id}`; return r.count > 0; } catch (e: any) { if (e?.code === '23503') throw new GraphQLError('Producto en pedidos existentes.', { extensions: { code: 'CONFLICT' } }); throw e; } },
  crearCategoria: async (_: unknown, { input }: Row, ctx: Context) => {
    requireAdmin(ctx);
    const nombre = String(input?.nombre ?? '').trim(); if (!nombre) throw new GraphQLError('El nombre es obligatorio', { extensions: { code: 'BAD_USER_INPUT' } });
    const [existe] = await sql`SELECT id FROM categoria WHERE LOWER(nombre) = ${nombre.toLowerCase()}`;
    if (existe) throw new GraphQLError('Ya existe una categoría con ese nombre', { extensions: { code: 'CONFLICT' } });
    const [r] = await sql`INSERT INTO categoria (nombre) VALUES (${nombre}) RETURNING *`; return mapCategoria(r);
  },
  actualizarCategoria: async (_: unknown, { id, input }: Row, ctx: Context) => {
    requireAdmin(ctx);
    const nombre = String(input?.nombre ?? '').trim(); if (!nombre) throw new GraphQLError('El nombre es obligatorio', { extensions: { code: 'BAD_USER_INPUT' } });
    const [prev] = await sql`SELECT * FROM categoria WHERE id = ${id}`; if (!prev) throw new GraphQLError(`Categoría ${id} no encontrada`, { extensions: { code: 'NOT_FOUND' } });
    const [dup] = await sql`SELECT id FROM categoria WHERE LOWER(nombre) = ${nombre.toLowerCase()} AND id <> ${id}`;
    if (dup) throw new GraphQLError('Ya existe otra categoría con ese nombre', { extensions: { code: 'CONFLICT' } });
    const [r] = await sql`UPDATE categoria SET nombre = ${nombre} WHERE id = ${id} RETURNING *`; return mapCategoria(r);
  },
  eliminarCategoria: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAdmin(ctx);
    const [c] = await sql`SELECT * FROM categoria WHERE id = ${id}`; if (!c) throw new GraphQLError(`Categoría ${id} no encontrada`, { extensions: { code: 'NOT_FOUND' } });
    const [count] = await sql`SELECT COUNT(*)::int AS n FROM producto WHERE categoria_id = ${id}`;
    if (Number(count?.n ?? 0) > 0) throw new GraphQLError(`No se puede eliminar: la categoría tiene ${count.n} productos asignados.`, { extensions: { code: 'CONFLICT' } });
    const r = await sql`DELETE FROM categoria WHERE id = ${id}`; return r.count > 0;
  },
  actualizarEstadoPedido: async (_: unknown, { id, status }: { id: string; status: string }, ctx: Context) => {
    requireAdmin(ctx);
    if (!ESTADOS_VALIDOS.includes(status as any)) throw new GraphQLError(`Status inválido: ${status}`, { extensions: { code: 'BAD_USER_INPUT' } });
    const [prev] = await sql`SELECT * FROM pedido WHERE id = ${id}`; if (!prev) throw new GraphQLError(`Pedido ${id} no encontrado`, { extensions: { code: 'NOT_FOUND' } });
    const [r] = await sql`UPDATE pedido SET status = ${status} WHERE id = ${id} RETURNING *`; return mapPedido(r);
  },
  cancelarPedido: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAdmin(ctx);
    const pedido = await sql.begin(async (tx) => {
      const [p] = await tx`SELECT * FROM pedido WHERE id = ${id} FOR UPDATE`;
      if (!p) throw new GraphQLError(`Pedido ${id} no encontrado`, { extensions: { code: 'NOT_FOUND' } });
      if (p.status === 'CANCELADO') throw new GraphQLError('El pedido ya está cancelado', { extensions: { code: 'BAD_USER_INPUT' } });
      const detalles = await tx`SELECT * FROM pedido_detalle WHERE pedido_id = ${id}`;
      for (const d of detalles as Row[]) await tx`UPDATE producto SET stock = stock + ${d.cantidad} WHERE id = ${d.producto_id}`;
      const [updated] = await tx`UPDATE pedido SET status = 'CANCELADO' WHERE id = ${id} RETURNING *`; return updated;
    });
    return mapPedido(pedido);
  },
  eliminarUsuario: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    const admin = requireAdmin(ctx);
    if (admin.sub === id) throw new GraphQLError('No puedes eliminar tu propia cuenta', { extensions: { code: 'BAD_USER_INPUT' } });
    const [u] = await sql`SELECT * FROM usuario WHERE id = ${id}`; if (!u) throw new GraphQLError(`Usuario ${id} no encontrado`, { extensions: { code: 'NOT_FOUND' } });
    try { const r = await sql`DELETE FROM usuario WHERE id = ${id}`; return r.count > 0; }
    catch (e: any) { if (e?.code === '23503') throw new GraphQLError('Usuario con pedidos registrados.', { extensions: { code: 'CONFLICT' } }); throw e; }
  },
  cambiarPasswordUsuario: async (_: unknown, { id, newPassword }: { id: string; newPassword: string }, ctx: Context) => {
    requireAdmin(ctx);
    if (String(newPassword).length < 6) throw new GraphQLError('Contraseña mínima de 6 caracteres', { extensions: { code: 'BAD_USER_INPUT' } });
    const [u] = await sql`SELECT * FROM usuario WHERE id = ${id}`; if (!u) throw new GraphQLError(`Usuario ${id} no encontrado`, { extensions: { code: 'NOT_FOUND' } });
    const hash = await hashPassword(String(newPassword)); await sql`UPDATE usuario SET password = ${hash} WHERE id = ${id}`; return true;
  },
  cambiarRolUsuario: async (_: unknown, { id, rol }: { id: string; rol: string }, ctx: Context) => {
    const admin = requireAdmin(ctx);
    if (!ROLES_VALIDOS.includes(rol as any)) throw new GraphQLError(`Rol inválido: ${rol}`, { extensions: { code: 'BAD_USER_INPUT' } });
    if (admin.sub === id) throw new GraphQLError('No puedes cambiar tu propio rol', { extensions: { code: 'BAD_USER_INPUT' } });
    const [u] = await sql`SELECT * FROM usuario WHERE id = ${id}`; if (!u) throw new GraphQLError(`Usuario ${id} no encontrado`, { extensions: { code: 'NOT_FOUND' } });
    const [r] = await sql`UPDATE usuario SET rol = ${rol} WHERE id = ${id} RETURNING *`; return mapUsuario(r);
  },
  crearUsuario: async (_: unknown, { input }: Row, ctx: Context) => {
    requireAdmin(ctx);
    const nombre = String(input?.nombre ?? '').trim(); const email = String(input?.email ?? '').toLowerCase(); const password = String(input?.password ?? ''); const rol = String(input?.rol ?? 'CLIENTE');
    if (!nombre) throw new GraphQLError('El nombre es obligatorio', { extensions: { code: 'BAD_USER_INPUT' } });
    if (!email.includes('@')) throw new GraphQLError('Email inválido', { extensions: { code: 'BAD_USER_INPUT' } });
    if (password.length < 6) throw new GraphQLError('Contraseña mínima de 6 caracteres', { extensions: { code: 'BAD_USER_INPUT' } });
    if (!ROLES_VALIDOS.includes(rol as any)) throw new GraphQLError(`Rol inválido: ${rol}`, { extensions: { code: 'BAD_USER_INPUT' } });
    const [existe] = await sql`SELECT id FROM usuario WHERE email = ${email}`;
    if (existe) throw new GraphQLError('Ya existe un usuario con ese email', { extensions: { code: 'CONFLICT' } });
    const hash = await hashPassword(password);
    const [row] = await sql`INSERT INTO usuario (nombre, email, password, rol) VALUES (${nombre}, ${email}, ${hash}, ${rol}) RETURNING *`;
    return mapUsuario(row);
  },
};
