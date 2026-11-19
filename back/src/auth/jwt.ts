import { SignJWT, jwtVerify } from 'jose';
const encoder = new TextEncoder();
function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error('JWT_SECRET muy corto');
  return encoder.encode(s);
}
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
export type AuthPayload = { sub: string; email: string; rol: 'ADMIN' | 'CLIENTE' };
export async function firmarToken(payload: AuthPayload, expiresIn?: string): Promise<string> {
  return await new SignJWT({ email: payload.email, rol: payload.rol })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(payload.sub)
    .setIssuedAt().setExpirationTime(expiresIn ?? EXPIRES_IN).sign(getSecret());
}
export async function verificarToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return { sub: String(payload.sub), email: String(payload.email), rol: payload.rol as 'ADMIN' | 'CLIENTE' };
}
