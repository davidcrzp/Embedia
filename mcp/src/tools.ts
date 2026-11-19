import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { gql, guardEscritura } from './client.ts';
const PRODUCTO_FIELDS = `id nombre precio imagen stock categoria { id nombre }`;
const PEDIDO_FIELDS = `id fecha total status metodoPago mpOrderId mpPaymentId mpPaymentMethod mpLast4 mpInstallments mpTicketUrl mpBarcode mpReference mpExpiresAt usuario { id nombre email } detalles { id cantidad precio producto { id nombre } }`;
export function registerTools(server: McpServer) {
  server.tool('listar_categorias', 'Lista todas las categorías del catálogo.', {}, async () => {
    const d = await gql<any>(`query { categorias { id nombre totalProductos } }`);
    return { content: [{ type: 'text', text: JSON.stringify(d.categorias, null, 2) }] };
  });
  server.tool('listar_productos', 'Lista productos con paginación. Devuelve id, nombre, precio, stock y categoría.',
    { limit: z.number().int().min(1).max(500).default(50), offset: z.number().int().min(0).default(0) },
    async ({ limit, offset }) => {
      const d = await gql<any>(`query($l:Int!,$o:Int!){ productos(limit:$l, offset:$o){ ${PRODUCTO_FIELDS} } }`, { l: limit, o: offset });
      return { content: [{ type: 'text', text: JSON.stringify(d.productos, null, 2) }] };
    });
  server.tool('buscar_productos', 'Busca productos por texto (nombre o categoría). Case-insensitive.',
    { texto: z.string().min(1) },
    async ({ texto }) => {
      const d = await gql<any>(`query { productos(limit: 500, offset: 0){ ${PRODUCTO_FIELDS} } }`);
      const q = texto.toLowerCase();
      const found = (d.productos as any[]).filter((p) => String(p.nombre).toLowerCase().includes(q) || String(p.categoria?.nombre ?? '').toLowerCase().includes(q));
      return { content: [{ type: 'text', text: JSON.stringify(found, null, 2) }] };
    });
  server.tool('obtener_producto', 'Obtiene el detalle de un producto por id.', { id: z.string().min(1) }, async ({ id }) => {
    const d = await gql<any>(`query($id:ID!){ producto(id:$id){ ${PRODUCTO_FIELDS} } }`, { id });
    if (!d.producto) return { content: [{ type: 'text', text: `Producto ${id} no encontrado.` }], isError: true };
    return { content: [{ type: 'text', text: JSON.stringify(d.producto, null, 2) }] };
  });
  server.tool('listar_pedidos', 'Lista pedidos recientes. Filtro opcional por estado.',
    { limit: z.number().int().min(1).max(200).default(20), status: z.enum(['PENDIENTE','PAGADO','ENVIADO','COMPLETADO','CANCELADO']).optional() },
    async ({ limit, status }) => {
      const d = await gql<any>(`query { pedidos { ${PEDIDO_FIELDS} } }`);
      let rows = d.pedidos as any[];
      if (status) rows = rows.filter((p) => p.status === status);
      return { content: [{ type: 'text', text: JSON.stringify(rows.slice(0, limit), null, 2) }] };
    });
  server.tool('obtener_pedido', 'Obtiene el detalle completo de un pedido por id (incluye ticket OXXO si aplica).',
    { id: z.string().min(1) },
    async ({ id }) => {
      const d = await gql<any>(`query { pedidos { ${PEDIDO_FIELDS} } }`);
      const found = (d.pedidos as any[]).find((p) => p.id === id);
      if (!found) return { content: [{ type: 'text', text: `Pedido ${id} no encontrado.` }], isError: true };
      return { content: [{ type: 'text', text: JSON.stringify(found, null, 2) }] };
    });
  server.tool('listar_usuarios', 'Lista usuarios (solo ADMIN).', {}, async () => {
    const d = await gql<any>(`query { usuarios { id nombre email rol pedidos { id } } }`);
    const rows = (d.usuarios as any[]).map((u) => ({ ...u, pedidos: u.pedidos?.length ?? 0 }));
    return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
  });
  server.tool('estadisticas_negocio', 'Resumen agregado: pedidos, ventas, pendientes, stock y usuarios.', {}, async () => {
    const d = await gql<any>(`query { pedidos { id total status } productos(limit: 1000, offset: 0) { id stock } usuarios { id rol } categorias { id } }`);
    const pedidos = d.pedidos as any[];
    const ventas = pedidos.filter((p) => p.status !== 'CANCELADO').reduce((s, p) => s + Number(p.total), 0);
    const pendientes = pedidos.filter((p) => p.status === 'PENDIENTE').length;
    const stockTotal = (d.productos as any[]).reduce((s, p) => s + Number(p.stock), 0);
    const sinStock = (d.productos as any[]).filter((p) => Number(p.stock) === 0).length;
    const clientes = (d.usuarios as any[]).filter((u) => u.rol === 'CLIENTE').length;
    const admins = (d.usuarios as any[]).filter((u) => u.rol === 'ADMIN').length;
    return { content: [{ type: 'text', text: JSON.stringify({ pedidos: pedidos.length, ventas, pendientes, productos: (d.productos as any[]).length, stockTotal, sinStock, categorias: (d.categorias as any[]).length, clientes, admins }, null, 2) }] };
  });
  server.tool('crear_producto', 'Crea un producto. Requiere MCP_ALLOW_WRITES=true.',
    { nombre: z.string().min(1), precio: z.number().positive(), stock: z.number().int().min(0), categoriaId: z.string().min(1), imagen: z.string().url().optional() },
    async (input) => { guardEscritura(); const d = await gql<any>(`mutation($input: ProductoInput!){ crearProducto(input:$input){ ${PRODUCTO_FIELDS} } }`, { input }); return { content: [{ type: 'text', text: JSON.stringify(d.crearProducto, null, 2) }] }; });
  server.tool('actualizar_stock', 'Actualiza el stock de un producto. Requiere MCP_ALLOW_WRITES=true.',
    { id: z.string().min(1), stock: z.number().int().min(0) },
    async ({ id, stock }) => { guardEscritura(); const d = await gql<any>(`mutation($id:ID!,$input:ProductoUpdateInput!){ actualizarProducto(id:$id, input:$input){ ${PRODUCTO_FIELDS} } }`, { id, input: { stock } }); return { content: [{ type: 'text', text: JSON.stringify(d.actualizarProducto, null, 2) }] }; });
  server.tool('actualizar_estado_pedido', 'Cambia el estado de un pedido. Requiere MCP_ALLOW_WRITES=true.',
    { id: z.string().min(1), status: z.enum(['PENDIENTE','PAGADO','ENVIADO','COMPLETADO','CANCELADO']) },
    async ({ id, status }) => { guardEscritura(); const d = await gql<any>(`mutation($id:ID!,$status:EstadoPedido!){ actualizarEstadoPedido(id:$id, status:$status){ id status } }`, { id, status }); return { content: [{ type: 'text', text: JSON.stringify(d.actualizarEstadoPedido, null, 2) }] }; });
  server.tool('cancelar_pedido', 'Cancela un pedido y restaura stock. Requiere MCP_ALLOW_WRITES=true.',
    { id: z.string().min(1) },
    async ({ id }) => { guardEscritura(); const d = await gql<any>(`mutation($id:ID!){ cancelarPedido(id:$id){ id status } }`, { id }); return { content: [{ type: 'text', text: JSON.stringify(d.cancelarPedido, null, 2) }] }; });
}
