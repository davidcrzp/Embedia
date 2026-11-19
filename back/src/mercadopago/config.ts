export const MP_API = 'https://api.mercadopago.com';
export function getAccessToken(): string {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t || t.length < 10 || t.includes('xxxxxxxx')) throw new Error('MP_ACCESS_TOKEN no configurado.');
  return t;
}
