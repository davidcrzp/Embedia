/**
 * Obtiene un JWT de ADMIN para el MCP.
 * Uso:
 *   MCP_EMAIL=admin@embedia.com MCP_PASSWORD=admin1234 bun run login
 * Copia el `token` resultante en MCP_ADMIN_TOKEN dentro de .env.
 *
 * NOTA: el token expira según JWT_EXPIRES_IN del backend (7d por defecto).
 * Para tokens de larga vida (1 año), define JWT_EXPIRES_IN_MCP=365d en el
 * backend y ajusta src/graphql/resolvers/mutations.ts (login) si quieres
 * emitirlo condicionalmente. Alternativa simple: define JWT_EXPIRES_IN=365d
 * SOLO en el servicio que usa el MCP (no en el principal).
 */
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000';
const email = process.env.MCP_EMAIL;
const password = process.env.MCP_PASSWORD;
if (!email || !password) {
  console.error('Define MCP_EMAIL y MCP_PASSWORD. Ej:');
  console.error('  MCP_EMAIL=admin@embedia.com MCP_PASSWORD=admin1234 bun run login');
  process.exit(1);
}
const res = await fetch(`${BACKEND}/graphql`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'mutation($input: LoginInput!){ login(input:$input){ token usuario{ id rol } } }',
    variables: { input: { email, password } },
  }),
});
const json = await res.json().catch(() => ({}));
const token = json?.data?.login?.token;
const rol = json?.data?.login?.usuario?.rol;
if (!token) {
  console.error('No se obtuvo token. Respuesta:', JSON.stringify(json));
  process.exit(1);
}
if (rol !== 'ADMIN') {
  console.error(`El usuario ${email} tiene rol ${rol}; el MCP requiere ADMIN.`);
  process.exit(1);
}
console.log('\n✅ Token ADMIN generado. Añade esta línea a p26/mcp/.env:\n');
console.log(`MCP_ADMIN_TOKEN=${token}\n`);
