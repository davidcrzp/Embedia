import type { Context } from '../context';
import { suscribirPedidoCreado, type PedidoCreadoEvento } from '../pubsub';
import { requireAdmin } from './helpers';
export const Subscription = {
  pedidoCreado: {
    subscribe: (_: unknown, _a: unknown, ctx: Context) => { requireAdmin(ctx); return suscribirPedidoCreado(); },
    resolve: (payload: PedidoCreadoEvento) => payload,
  },
};
