# Embedia — MCP Server

Puente estándar (Model Context Protocol) para conectar un agente IA al ecommerce.
**La IA no está implementada**: aquí solo vive el contrato (tools/resources/prompts).

## Cambios de esta versión
1. `src/http.ts`: `GET /health` (Railway) + acepta `PORT` o `MCP_PORT`.
2. `railway.json`: `startCommand: bun run http`, healthcheck `/health`.
3. `scripts/login.ts`: eliminado `/auth/login` REST redundante (solo GraphQL).
4. `.env.example`: documentado para stdio (local) y HTTP (Railway).

## Local (stdio — Claude Desktop / Cursor / VS Code)
```bash
cd p26/mcp
bun install
MCP_EMAIL=admin@embedia.com MCP_PASSWORD=admin1234 bun run login   # copia token a .env
bun run dev   # stdio
