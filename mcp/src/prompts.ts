import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { gql } from './client.ts';
export function registerPrompts(server: McpServer) {
  server.prompt('resumen_diario', 'Genera un prompt con el estado actual del negocio para que el LLM redacte un resumen ejecutivo.', {}, async () => {
    const d = await gql<any>(`query { pedidos { id total status fecha metodoPago } productos(limit: 1000, offset: 0) { id nombre stock } usuarios { id rol } }`);
    const pedidos = d.pedidos as any[];
    const ventas = pedidos.filter((p) => p.status !== 'CANCELADO').reduce((s, p) => s + Number(p.total), 0);
    const pendientes = pedidos.filter((p) => p.status === 'PENDIENTE');
    const sinStock = (d.productos as any[]).filter((p) => Number(p.stock) === 0);
    const texto = [
      'Eres el analista operativo de Embedia (ecommerce de hardware embebido).',
      'Redacta un resumen ejecutivo breve (máx. 200 palabras) con:',
      `- Pedidos totales: ${pedidos.length} · Ventas acumuladas: $${ventas.toFixed(2)}`,
      `- Pedidos pendientes (${pendientes.length}): ${pendientes.map((p) => `#${p.id}`).join(', ') || 'ninguno'}`,
      `- Productos sin stock (${sinStock.length}): ${sinStock.map((p) => p.nombre).join(', ') || 'ninguno'}`,
      '- Recomienda 2 acciones concretas para hoy.',
    ].join('\n');
    return { messages: [{ role: 'user', content: { type: 'text', text: texto } }] };
  });
  server.prompt('atender_pedido_oxxo', 'Prepara el contexto para redactar un mensaje de seguimiento a un cliente con pedido OXXO pendiente.',
    { pedidoId: z.string().min(1) },
    async ({ pedidoId }) => {
      const d = await gql<any>(`query { pedidos { id status metodoPago mpReference mpBarcode mpExpiresAt total usuario { nombre email } } }`);
      const p = (d.pedidos as any[]).find((x) => x.id === pedidoId);
      if (!p) return { messages: [{ role: 'user', content: { type: 'text', text: `Pedido ${pedidoId} no encontrado.` } }] };
      const texto = [
        `Redacta un correo breve y amable para ${p.usuario?.nombre} (${p.usuario?.email}).`,
        `Pedido #${p.id} · Total $${Number(p.total).toFixed(2)} · Estado: ${p.status}.`,
        `Método: OXXO. Referencia: ${p.mpReference ?? 'N/D'}. Código de barras: ${p.mpBarcode ?? 'N/D'}.`,
        `Vence: ${p.mpExpiresAt ?? 'N/D'}.`,
        'Incluye instrucciones claras para pagar en tienda y qué hacer si el ticket ya venció.',
      ].join('\n');
      return { messages: [{ role: 'user', content: { type: 'text', text: texto } }] };
    });
}
