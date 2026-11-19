import { readFileSync } from 'node:fs';
import postgres from 'postgres';
import { hashPassword } from '../auth/password';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Falta DATABASE_URL');
const sql = postgres(connectionString, { onnotice: () => {} });
const script = readFileSync('./db.sql', 'utf-8');
console.log('[ensure-db] Aplicando esquema idempotente…');
const adminHash = await hashPassword('admin1234');
const clienteHash = await hashPassword('cliente1234');
const scriptFinal = script.replace('__ADMIN_HASH__', adminHash).replace('__CLIENTE_HASH__', clienteHash);
try {
  await sql.unsafe(scriptFinal);
  console.log('[ensure-db] ✅ Esquema listo (seed solo si estaba vacío).');
} catch (e) { console.error('[ensure-db] ❌ Error:', e); process.exit(1); }
finally { await sql.end(); }
