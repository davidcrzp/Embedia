import { GraphQLError } from 'graphql';
import type { Context } from '../context';
export function requireAuth(ctx: Context) {
  if (!ctx.usuario) throw new GraphQLError('No autenticado', { extensions: { code: 'UNAUTHENTICATED' } });
  return ctx.usuario;
}
export function requireAdmin(ctx: Context) {
  const u = requireAuth(ctx);
  if (u.rol !== 'ADMIN') throw new GraphQLError('Requiere rol ADMIN', { extensions: { code: 'FORBIDDEN' } });
  return u;
}
