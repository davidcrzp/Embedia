import { Hono } from 'hono';
import { sql } from '../db/client';
import { extractToken } from '../auth/cookies';
import { verificarToken } from '../auth/jwt';
import { crearOrdenMP } from '../mercadopago/orders';
import { crearPagoOxxo } from '../mercadopago/oxxo';
import { MPError } from '../mercadopago/errors';
import { publicarPedidoCreado } from '../graphql/pubsub';
export const checkoutRoutes = new Hono();
type ItemValidado = { producto: any; cantidad: number };
async function validarCarrito(items: any[]) {
  const validados: ItemValidado[] = [];
  for (const it of items) {
    const [p] = await sql`SELECT * FROM producto WHERE id = ${String(it.id)}`;
    if (!p) return { ok: false as const, error: 'Un producto del carrito ya no existe.', status: 404 };
    const cant = Number(it.cantidad);
    if (!Number.isInteger(cant) || cant <= 0) return { ok: false as const, error: 'Cantidad inválida en el carrito.', status: 400 };
    if (Number(p.stock) < cant) return { ok: false as const, error: `No hay stock suficiente de "${p.nombre}".`, status: 409 };
    validados.push({ producto: p, cantidad: cant });
  }
  const total = validados.reduce((s, d) => s + Number(d.producto.precio) * d.cantidad, 0);
  return { ok: true as const, validados, total };
}
function extraerDireccion(body: any) {
  const direccion = typeof body?.direccion === 'string' ? body.direccion.trim().slice(0, 300) : null;
  const lat = Number.isFinite(Number(body?.lat)) ? Number(body.lat) : null;
  const lng = Number.isFinite(Number(body?.lng)) ? Number(body.lng) : null;
  return { direccion, lat, lng };
}
async function insertarPedido(opts: { usuarioId: string; total: number; status: string; metodoPago: string; mp: any; direccion?: string | null; lat?: number | null; lng?: number | null; detalles: ItemValidado[]; }) {
  const pedidoId = await sql.begin(async (tx) => {
    const [row] = await tx`
      INSERT INTO pedido (fecha, total, status, usuario_id, metodo_pago, mp_order_id, mp_payment_id, mp_status, mp_payment_method, mp_last4, mp_installments, mp_ticket_url, mp_barcode, mp_reference, mp_expires_at, direccion, lat, lng)
      VALUES (${new Date().toISOString()}, ${opts.total}, ${opts.status}, ${opts.usuarioId}, ${opts.metodoPago}, ${opts.mp.orderId ?? null}, ${opts.mp.paymentId ?? null}, ${opts.mp.mpStatus ?? null}, ${opts.mp.paymentMethod ?? null}, ${opts.mp.last4 ?? null}, ${opts.mp.installments ?? null}, ${opts.mp.ticketUrl ?? null}, ${opts.mp.barcode ?? null}, ${opts.mp.reference ?? null}, ${opts.mp.expiresAt ?? null}, ${opts.direccion ?? null}, ${opts.lat ?? null}, ${opts.lng ?? null})
      RETURNING id`;
    const nuevoId = Number(row.id);
    for (const d of opts.detalles) {
      await tx`INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio) VALUES (${nuevoId}, ${d.producto.id}, ${d.cantidad}, ${d.producto.precio})`;
      const upd = await tx`UPDATE producto SET stock = stock - ${d.cantidad} WHERE id = ${d.producto.id} AND stock >= ${d.cantidad}`;
      if (upd.count === 0) throw new Error(`STOCK_RACE:${d.producto.id}`);
    }
    return nuevoId;
  });
  void publicarPedidoCreado(pedidoId);
  return pedidoId;
}
checkoutRoutes.post('/process-payment', async (c) => {
  const token = extractToken(c.req.raw.headers);
  if (!token) return c.json({ error: 'Debes iniciar sesión para completar el pago.' }, 401);
  let usuario;
  try { usuario = await verificarToken(token); } catch { return c.json({ error: 'Tu sesión expiró.' }, 401); }
  const body = await c.req.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || body.items.length === 0) return c.json({ error: 'El carrito está vacío.' }, 400);
  if (!body.token || !body.payment_method_id) return c.json({ error: 'Faltan datos de la tarjeta.' }, 400);
  if (!body.payer?.email?.includes('@')) return c.json({ error: 'El correo del comprador es obligatorio.' }, 400);
  const check = await validarCarrito(body.items); if (!check.ok) return c.json({ error: check.error }, check.status as any);
  const { validados, total } = check;
  const { direccion, lat, lng } = extraerDireccion(body);
  let orden;
  try {
    orden = await crearOrdenMP({ pedidoId: 0, total, payerEmail: String(body.payer.email).trim().toLowerCase(), token: String(body.token), paymentMethodId: String(body.payment_method_id), installments: Number(body.installments ?? 1), payerIdentification: body.payer?.identification ?? undefined, externalReference: crypto.randomUUID() });
  } catch (err: any) {
    if (err instanceof MPError) return c.json({ error: err.userMessage, code: err.statusDetail || 'payment_rejected' }, err.httpStatus as any);
    return c.json({ error: 'No pudimos completar el pago.' }, 500);
  }
  try {
    const pedidoId = await insertarPedido({ usuarioId: usuario.sub, total, status: 'PAGADO', metodoPago: 'tarjeta', mp: { orderId: orden.orderId, paymentId: orden.paymentId, mpStatus: orden.mpStatus, paymentMethod: orden.paymentMethodId, last4: orden.last4, installments: orden.installments }, direccion, lat, lng, detalles: validados });
    return c.json({ pedidoId, status: 'PAGADO', mpPaymentId: orden.paymentId, last4: orden.last4, installments: orden.installments });
  } catch (err: any) {
    if (typeof err?.message === 'string' && err.message.startsWith('STOCK_RACE')) return c.json({ error: 'El pago fue aprobado pero un producto ya no tiene stock. Contacta a soporte con el código ' + orden.paymentId + '.' }, 409);
    return c.json({ error: 'El pago fue aprobado pero no pudimos registrar tu pedido. Contacta a soporte con el código ' + orden.paymentId + '.' }, 500);
  }
});
checkoutRoutes.post('/process-oxxo', async (c) => {
  const token = extractToken(c.req.raw.headers);
  if (!token) return c.json({ error: 'Debes iniciar sesión para generar el ticket.' }, 401);
  let usuario;
  try { usuario = await verificarToken(token); } catch { return c.json({ error: 'Tu sesión expiró.' }, 401); }
  const body = await c.req.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || body.items.length === 0) return c.json({ error: 'El carrito está vacío.' }, 400);
  if (!body.payer?.email?.includes('@')) return c.json({ error: 'El correo del comprador es obligatorio.' }, 400);
  const check = await validarCarrito(body.items); if (!check.ok) return c.json({ error: check.error }, check.status as any);
  const { validados, total } = check;
  const { direccion, lat, lng } = extraerDireccion(body);
  const [u] = await sql`SELECT nombre FROM usuario WHERE id = ${usuario.sub}`;
  const partes = String(u?.nombre ?? 'Cliente Embedia').trim().split(/\s+/);
  const firstName = partes[0] || 'Cliente'; const lastName = partes.slice(1).join(' ') || 'Embedia';
  let oxxo;
  try { oxxo = await crearPagoOxxo({ total, payerEmail: String(body.payer.email).trim().toLowerCase(), payerFirstName: firstName, payerLastName: lastName, externalReference: crypto.randomUUID(), description: 'Embedia — Compra en tienda' }); }
  catch (err: any) {
    if (err instanceof MPError) return c.json({ error: err.userMessage, code: err.statusDetail || 'oxxo_failed' }, err.httpStatus as any);
    return c.json({ error: 'No pudimos generar el ticket.' }, 500);
  }
  try {
    const pedidoId = await insertarPedido({ usuarioId: usuario.sub, total, status: 'PENDIENTE', metodoPago: 'oxxo', mp: { orderId: oxxo.orderId, paymentId: oxxo.paymentId, mpStatus: oxxo.mpStatus, paymentMethod: 'oxxo', ticketUrl: oxxo.ticketUrl, barcode: oxxo.barcode, reference: oxxo.reference, expiresAt: oxxo.expiresAt }, direccion, lat, lng, detalles: validados });
    return c.json({ pedidoId, status: 'PENDIENTE', mpOrderId: oxxo.orderId, mpPaymentId: oxxo.paymentId, ticketUrl: oxxo.ticketUrl, barcode: oxxo.barcode, reference: oxxo.reference, expiresAt: oxxo.expiresAt });
  } catch (err: any) {
    if (typeof err?.message === 'string' && err.message.startsWith('STOCK_RACE')) return c.json({ error: 'El ticket fue generado pero un producto ya no tiene stock. Contacta a soporte con el código ' + oxxo.orderId + '.' }, 409);
    return c.json({ error: 'El ticket fue generado pero no pudimos registrar tu pedido. Contacta a soporte con el código ' + oxxo.orderId + '.' }, 500);
  }
});
