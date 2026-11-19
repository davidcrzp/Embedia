import { readFileSync } from 'node:fs';
import postgres from 'postgres';
import { hashPassword } from '../auth/password';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Falta DATABASE_URL');
const sql = postgres(connectionString, { onnotice: () => {} });
const script = readFileSync('./db.sql', 'utf-8');
console.log('[reset-db] ⚠️  DESTRUCTIVO: borrando tablas y recreando…');
const adminHash = await hashPassword('admin1234');
const clienteHash = await hashPassword('cliente1234');
const scriptFinal = script.replace('__ADMIN_HASH__', adminHash).replace('__CLIENTE_HASH__', clienteHash);
try {
  await sql.unsafe(`
    DROP TABLE IF EXISTS pedido_detalle CASCADE;
    DROP TABLE IF EXISTS pedido CASCADE;
    DROP TABLE IF EXISTS producto CASCADE;
    DROP TABLE IF EXISTS categoria CASCADE;
    DROP TABLE IF EXISTS usuario CASCADE;
  `);
  await sql.unsafe(scriptFinal);
  console.log('[reset-db] ✅ Base recreada.');
  console.log('       admin@embedia.com / admin1234');
  console.log('       cliente@embedia.com / cliente1234');
} catch (e) { console.error('[reset-db] ❌ Error:', e); process.exit(1); }
finally { await sql.end(); }
