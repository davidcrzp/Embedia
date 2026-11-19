import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { gql } from './client.ts';
export function registerResources(server: McpServer) {
  server.resource('catalogo', 'embedia://catalogo', async (uri) => {
    const d = await gql<any>(`query { productos(limit: 500, offset: 0){ id nombre precio stock categoria { id nombre } } }`);
    return { contents: [{ uri: uri.href, text: JSON.stringify(d.productos, null, 2), mimeType: 'application/json' }] };
  });
  server.resource('pedidos-recientes', 'embedia://pedidos/recientes', async (uri) => {
    const d = await gql<any>(`query { pedidos { id fecha total status metodoPago usuario { nombre email } } }`);
    return { contents: [{ uri: uri.href, text: JSON.stringify((d.pedidos as any[]).slice(0, 20), null, 2), mimeType: 'application/json' }] };
  });
  server.resource('pedido', new ResourceTemplate('embedia://pedidos/{id}', { list: undefined }), async (uri, { id }) => {
    const d = await gql<any>(`query { pedidos { id fecha total status metodoPago mpTicketUrl mpBarcode mpReference usuario { nombre email } detalles { cantidad precio producto { nombre } } } }`);
    const found = (d.pedidos as any[]).find((p) => p.id === String(id));
    return { contents: [{ uri: uri.href, text: found ? JSON.stringify(found, null, 2) : `Pedido ${id} no encontrado`, mimeType: found ? 'application/json' : 'text/plain' }] };
  });
}
