export const COOKIE_TOKEN = 'embedia_token';
export const COOKIE_ADMIN = 'embedia_admin';
const MAX_AGE = 60 * 60 * 24 * 7;

const SECURE = process.env.COOKIE_SECURE === 'true';
const RAW_SAME_SITE = String(process.env.COOKIE_SAMESITE ?? 'Lax');
const SAME_SITE = (['Lax', 'Strict', 'None'].includes(RAW_SAME_SITE)
  ? RAW_SAME_SITE
  : 'Lax') as 'Lax' | 'Strict' | 'None';

const DOMAIN = process.env.COOKIE_DOMAIN ? `; Domain=${process.env.COOKIE_DOMAIN}` : '';
const EFFECTIVE_SECURE = SECURE || SAME_SITE === 'None';

function attrs(maxAge: number): string {
  return `Path=/; SameSite=${SAME_SITE}; Max-Age=${maxAge}${EFFECTIVE_SECURE ? '; Secure' : ''}${DOMAIN}`;
}

export function buildAuthCookies(token: string, rol: 'ADMIN' | 'CLIENTE'): string[] {
  const base = attrs(MAX_AGE);
  return [
    `${COOKIE_TOKEN}=${token}; ${base}; HttpOnly`,
    `${COOKIE_ADMIN}=${rol === 'ADMIN' ? '1' : '0'}; ${base}`,
  ];
}

export function buildClearCookies(): string[] {
  const base = attrs(0);
  return [`${COOKIE_TOKEN}=; ${base}; HttpOnly`, `${COOKIE_ADMIN}=; ${base}`];
}

export function readTokenFromCookieHeader(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const p of cookieHeader.split(';')) {
    const [k, ...rest] = p.trim().split('=');
    if (k === COOKIE_TOKEN) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function extractToken(headers: Headers): string | null {
  const auth = headers.get('authorization');
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return readTokenFromCookieHeader(headers.get('cookie'));
}
