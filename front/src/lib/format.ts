import { currency, usdRate } from './currency';

export function formatFecha(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { return String(iso); }
}
export function formatFechaCorta(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-MX', { year: '2-digit', month: '2-digit', day: '2-digit' }); }
  catch { return String(iso); }
}

export function formatMoney(n: number | string, code: 'MXN' | 'USD'): string {
  const amount = Number(n ?? 0).toFixed(2);
  return code === 'USD' ? `US${amount}` : `${amount}`;
}
export function formatPrecioMXN(n: number | string): string { return formatMoney(n, 'MXN'); }
export const formatPrecio = formatPrecioMXN;

export function formatPrecioDisplay(mxn: number | string): { text: string; code: 'MXN' | 'USD'; full: string } {
  const n = Number(mxn ?? 0);
  if (currency.value === 'USD') {
    const usd = n * usdRate.value;
    const text = formatMoney(usd, 'USD');
    return { text, code: 'USD', full: `${text} USD` };
  }
  const text = formatMoney(n, 'MXN');
  return { text, code: 'MXN', full: `${text} MXN` };
}

export function statusVariant(status: string): 'outline' | 'success' | 'destructive' | 'default' {
  const s = String(status).toUpperCase();
  if (s === 'PENDIENTE') return 'outline';
  if (s === 'PAGADO' || s === 'COMPLETADO' || s === 'ENVIADO') return 'success';
  if (s === 'CANCELADO') return 'destructive';
  return 'default';
}
export function formatTarjetaLabel(_pm: string | null | undefined, last4: string | null | undefined, installments?: number | null): string {
  const partes: string[] = [];
  if (last4) partes.push(`•••• ${last4}`); else partes.push('Tarjeta');
  if (installments && installments > 1) partes.push(`${installments} cuotas`);
  return partes.join(' · ');
}
export function metodoPagoLabel(metodo: string | null | undefined): string {
  const m = String(metodo ?? '').toLowerCase();
  if (m === 'oxxo') return 'OXXO (efectivo)';
  if (m === 'tarjeta') return 'Tarjeta';
  return metodo ? String(metodo) : '—';
}
