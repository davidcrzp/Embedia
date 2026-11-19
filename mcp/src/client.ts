const BACKEND = String(process.env.BACKEND_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
const TOKEN = String(process.env.MCP_ADMIN_TOKEN ?? '').trim();
export type GqlError = { message: string; extensions?: Record<string, any> };
export async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!TOKEN) throw new Error('MCP_ADMIN_TOKEN no configurado. Ejecuta `bun run login` en p26/mcp.');
  const res = await fetch(`${BACKEND}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  const json = await res.json();
  if (json.errors?.length) {
    const err: GqlError = json.errors[0];
    throw new Error(`[${err.extensions?.code ?? 'ERROR'}] ${err.message}`);
  }
  return json.data as T;
}
export function writesPermitidas(): boolean {
  return String(process.env.MCP_ALLOW_WRITES ?? 'false').toLowerCase() === 'true';
}
export function guardEscritura(): void {
  if (!writesPermitidas()) {
    throw new Error('Escritura deshabilitada. Define MCP_ALLOW_WRITES=true en p26/mcp/.env solo si el operador autoriza que el agente modifique datos.');
  }
}
