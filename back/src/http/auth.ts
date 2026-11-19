import { Hono } from 'hono';
import { sql } from '../db/client';
import { firmarToken, verificarToken } from '../auth/jwt';
import { hashPassword, verifyPassword } from '../auth/password';
import { buildAuthCookies, buildClearCookies, readTokenFromCookieHeader } from '../auth/cookies';
export const authRoutes = new Hono();
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = String(body?.email ?? '').toLowerCase(); const password = String(body?.password ?? '');
    if (!email || !password) return c.json({ error: 'Credenciales inválidas' }, 400);
    const [row] = await sql`SELECT * FROM usuario WHERE email = ${email}`;
    if (!row || !row.password) return c.json({ error: 'Credenciales inválidas' }, 401);
    if (!(await verifyPassword(password, row.password))) return c.json({ error: 'Credenciales inválidas' }, 401);
    const usuario = { id: String(row.id), nombre: String(row.nombre), email: String(row.email), rol: row.rol as 'ADMIN' | 'CLIENTE' };
    const token = await firmarToken({ sub: usuario.id, email: usuario.email, rol: usuario.rol });
    for (const ck of buildAuthCookies(token, usuario.rol)) c.header('Set-Cookie', ck, { append: true });
    return c.json({ usuario });
  } catch (e: any) { return c.json({ error: e?.message ?? 'Error interno' }, 500); }
});
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const nombre = String(body?.nombre ?? '').trim(); const email = String(body?.email ?? '').toLowerCase(); const password = String(body?.password ?? '');
    if (!nombre) return c.json({ error: 'El nombre es obligatorio' }, 400);
    if (!email.includes('@')) return c.json({ error: 'Email inválido' }, 400);
    if (password.length < 6) return c.json({ error: 'Contraseña mínima de 6 caracteres' }, 400);
    const [existe] = await sql`SELECT id FROM usuario WHERE email = ${email}`;
    if (existe) return c.json({ error: 'Ya existe un usuario con ese email' }, 409);
    const hash = await hashPassword(password);
    const [row] = await sql`INSERT INTO usuario (nombre, email, password, rol) VALUES (${nombre}, ${email}, ${hash}, 'CLIENTE') RETURNING *`;
    const usuario = { id: String(row.id), nombre: String(row.nombre), email: String(row.email), rol: row.rol as 'ADMIN' | 'CLIENTE' };
    const token = await firmarToken({ sub: usuario.id, email: usuario.email, rol: usuario.rol });
    for (const ck of buildAuthCookies(token, usuario.rol)) c.header('Set-Cookie', ck, { append: true });
    return c.json({ usuario });
  } catch (e: any) { return c.json({ error: e?.message ?? 'Error interno' }, 500); }
});
authRoutes.post('/logout', (c) => { for (const ck of buildClearCookies()) c.header('Set-Cookie', ck, { append: true }); return c.json({ ok: true }); });
authRoutes.get('/me', async (c) => {
  const token = readTokenFromCookieHeader(c.req.header('cookie'));
  if (!token) return c.json({ usuario: null });
  try {
    const payload = await verificarToken(token);
    const [row] = await sql`SELECT * FROM usuario WHERE id = ${payload.sub}`;
    if (!row) return c.json({ usuario: null });
    return c.json({ usuario: { id: String(row.id), nombre: String(row.nombre), email: String(row.email), rol: String(row.rol) } });
  } catch { return c.json({ usuario: null }); }
});
