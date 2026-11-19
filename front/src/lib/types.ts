export type Categoria = { id: string; nombre: string; totalProductos?: number };
export type Producto = { id: string; nombre: string; precio: number; imagen?: string | null; stock: number; categoria?: Categoria };
export type CartItem = { producto: Producto; cantidad: number };
export type Vista = 'home' | 'categoria' | 'carrito' | 'checkout' | 'pedidos';
export type Usuario = { id: string; nombre: string; email: string; rol: 'ADMIN' | 'CLIENTE' };
export type PedidoDetalle = { id: string; cantidad: number; precio: number; producto: { id: string; nombre: string; imagen?: string | null } };
export type Pedido = {
  id: string; fecha: string; total: number; status: string;
  metodoPago?: string | null; mpOrderId?: string | null; mpPaymentId?: string | null;
  mpPaymentMethod?: string | null; mpLast4?: string | null; mpInstallments?: number | null;
  mpTicketUrl?: string | null; mpBarcode?: string | null; mpReference?: string | null; mpExpiresAt?: string | null;
  direccion?: string | null; lat?: number | null; lng?: number | null;
  usuario?: { id: string; nombre: string; email: string }; detalles: PedidoDetalle[];
};
export type AdminUser = { id: string; nombre: string; email: string; rol: 'ADMIN' | 'CLIENTE'; pedidos?: { id: string }[] };
export type OxxoTicket = { pedidoId: number; status: string; mpOrderId?: string; mpPaymentId?: string; ticketUrl: string; barcode: string; reference: string; expiresAt: string };
