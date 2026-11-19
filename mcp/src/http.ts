/**
 * Modo HTTP para exponer el MCP a un agente remoto / Railway.
 * Ejecuta: bun run http
 *
 * Railway inyecta `PORT`; localmente usa `MCP_PORT` (default 3333).
 * Protege el endpoint con MCP_HTTP_TOKEN (Bearer).
 */
import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'node:crypto';
import { registerTools } from './tools.ts';
import { registerResources } from './resources.ts';
import { registerPrompts } from './prompts.ts';

const PORT = Number(process.env.PORT ?? process.env.MCP_PORT ?? 3333);
const AUTH = String(process.env.MCP_HTTP_TOKEN ?? '').trim();

function buildServer(): McpServer {
  const s = new McpServer(
    { name: 'embedia-mcp-http', version: '1.0.0' },
    { capabilities: { tools: {}, resources: {}, prompts: {} } },
  );
  registerTools(s);
  registerResources(s);
  registerPrompts(s);
  return s;
}

const sessions = new Map<string, { server: McpServer; transport: StreamableHTTPServerTransport }>();

const httpServer = createServer(async (req, res) => {
  // [CHANGED] Health check para Railway (sin auth).
  if (req.method === 'GET' && (req.url === '/health' || req.url === '/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'embedia-mcp', sessions: sessions.size }));
    return;
  }

  if (AUTH) {
    const header = req.headers.authorization ?? '';
    if (header !== `Bearer ${AUTH}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }

  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  if (url.pathname !== '/mcp') { res.writeHead(404).end('Not found'); return; }

  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (req.method === 'POST' && !sessionId) {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        sessions.set(id, { server, transport });
        console.error(`[mcp-http] sesión creada: ${id}`);
      },
    });
    const server = buildServer();
    transport.onclose = () => {
      const id = transport.sessionId;
      if (id) sessions.delete(id);
    };
    await server.connect(transport);
    await transport.handleRequest(req, res);
    return;
  }

  const session = sessionId ? sessions.get(sessionId) : undefined;
  if (!session) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Sesión no encontrada o header mcp-session-id ausente' }));
    return;
  }
  await session.transport.handleRequest(req, res);
});

httpServer.listen(PORT, () => {
  console.error(`[mcp-http] Embedia MCP (HTTP) escuchando en :${PORT}/mcp`);
  console.error(`[mcp-http] Health: :${PORT}/health`);
  console.error(`[mcp-http] Auth: ${AUTH ? 'Bearer' : 'DESHABILITADA (define MCP_HTTP_TOKEN)'}`);
});
