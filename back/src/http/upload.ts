import { Hono } from 'hono';
import { mkdir } from 'node:fs/promises';
import { extractToken } from '../auth/cookies';
import { verificarToken } from '../auth/jwt';
const UPLOAD_DIR = './uploads'; const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
await mkdir(UPLOAD_DIR, { recursive: true });
export const uploadRoutes = new Hono();
uploadRoutes.post('/', async (c) => {
  const token = extractToken(c.req.raw.headers);
  if (!token) return c.json({ error: 'No autenticado' }, 401);
  try { const u = await verificarToken(token); if (u.rol !== 'ADMIN') return c.json({ error: 'Requiere rol ADMIN' }, 403); }
  catch { return c.json({ error: 'Token inválido' }, 401); }
  const body = await c.req.parseBody(); const file = body['image'];
  if (!(file instanceof File)) return c.json({ error: 'Campo "image" requerido' }, 400);
  if (!ALLOWED_TYPES.includes(file.type)) return c.json({ error: 'Formato no permitido' }, 400);
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return c.json({ error: `Máximo ${MAX_SIZE_MB} MB` }, 400);
  const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' } as Record<string, string>)[file.type] ?? 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  await Bun.write(`${UPLOAD_DIR}/${filename}`, file);
  return c.json({ url: `/uploads/${filename}` });
});
