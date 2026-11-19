export type Row = Record<string, any>;
export const mapCategoria = (r: Row) => ({ id: String(r.id), nombre: String(r.nombre) });
export const mapProducto = (r: Row) => ({
  id: String(r.id), nombre: String(r.nombre), precio: Number(r.precio),
  imagen: r.imagen ?? null, stock: Number(r.stock), categoriaId: String(r.categoria_id),
});
export const mapPedido = (r: Row) => ({
  id: String(r.id), fecha: String(r.fecha), total: Number(r.total), status: String(r.status),
  usuarioId: String(r.usuario_id), metodoPago: r.metodo_pago ?? 'tarjeta',
  mpOrderId: r.mp_order_id ?? null, mpPaymentId: r.mp_payment_id ?? null,
  mpStatus: r.mp_status ?? null, mpPaymentMethod: r.mp_payment_method ?? null,
  mpLast4: r.mp_last4 ?? null, mpInstallments: r.mp_installments != null ? Number(r.mp_installments) : null,
  mpTicketUrl: r.mp_ticket_url ?? null, mpBarcode: r.mp_barcode ?? null,
  mpReference: r.mp_reference ?? null, mpExpiresAt: r.mp_expires_at ?? null,
  direccion: r.direccion ?? null,
  lat: r.lat != null ? Number(r.lat) : null,
  lng: r.lng != null ? Number(r.lng) : null,
});
export const mapUsuario = (r: Row) => ({ id: String(r.id), nombre: String(r.nombre), email: String(r.email), rol: String(r.rol) });
