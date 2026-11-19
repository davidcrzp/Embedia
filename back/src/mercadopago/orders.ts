import { MP_API, getAccessToken } from './config';
import { MPError, traducirStatusDetail } from './errors';
export type CrearOrdenInput = {
  pedidoId: number; total: number; payerEmail: string; token: string;
  paymentMethodId: string; installments: number;
  payerIdentification?: { type: string; number: string }; externalReference?: string;
};
export type CrearOrdenResult = {
  orderId: string; paymentId: string; mpStatus: string; statusDetail: string;
  paymentMethodId: string | null; last4: string | null; installments: number | null;
};
function buscarLast4(node: any, depth = 0): string | null {
  if (!node || typeof node !== 'object' || depth > 6) return null;
  for (const key of ['last_four_digits', 'lastFourDigits', 'last4', 'last_4']) {
    const v = node[key]; if (typeof v === 'string' && v.length > 0) return v;
  }
  for (const k of Object.keys(node)) {
    const child = node[k];
    if (child && typeof child === 'object') { const found = buscarLast4(child, depth + 1); if (found) return found; }
  }
  return null;
}
function extraerPago(json: any): any { return json?.transactions?.payments?.[0] ?? json?.payments?.[0] ?? json?.payment ?? {}; }
async function consultarOrden(orderId: string) {
  if (!orderId) return { last4: null, paymentMethodId: null, installments: null, paymentId: '' };
  try {
    const res = await fetch(`${MP_API}/v1/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Bearer ${getAccessToken()}` }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { last4: null, paymentMethodId: null, installments: null, paymentId: '' };
    const json: any = await res.json().catch(() => null); if (!json) return { last4: null, paymentMethodId: null, installments: null, paymentId: '' };
    const pago = extraerPago(json); const pm = pago?.payment_method ?? {};
    const last4 = (typeof pm?.last_four_digits === 'string' && pm.last_four_digits) || buscarLast4(json);
    const paymentMethodId = (typeof pm?.id === 'string' && pm.id) || (typeof pago?.payment_method_id === 'string' && pago.payment_method_id) || null;
    const installments = pm?.installments != null ? Number(pm.installments) : pago?.installments != null ? Number(pago.installments) : null;
    const paymentId = String(pago?.id ?? '');
    return { last4, paymentMethodId, installments, paymentId };
  } catch { return { last4: null, paymentMethodId: null, installments: null, paymentId: '' }; }
}
export async function crearOrdenMP(input: CrearOrdenInput): Promise<CrearOrdenResult> {
  const totalStr = Number(input.total).toFixed(2);
  const body: any = {
    type: 'online', total_amount: totalStr,
    external_reference: input.externalReference ?? String(input.pedidoId),
    payer: { email: input.payerEmail, identification: input.payerIdentification ?? { type: 'CURP', number: '99999999999' } },
    transactions: { payments: [{ amount: totalStr, payment_method: {
      id: String(input.paymentMethodId), type: 'credit_card', token: String(input.token),
      installments: Number(input.installments ?? 1), statement_descriptor: 'EMBEDIA',
    } }] },
  };
  let res: Response;
  try {
    res = await fetch(`${MP_API}/v1/orders`, { method: 'POST', headers: { Authorization: `Bearer ${getAccessToken()}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  } catch (e: any) { console.error('[MP] Error de red:', e?.message); throw MPError.red(); }
  const json: any = await res.json().catch(() => null);
  if (!res.ok) { console.error('[MP] HTTP', res.status, json); throw new MPError({ userMessage: 'No pudimos procesar el pago.', httpStatus: 502, technical: json }); }
  const mpStatus = String(json?.status ?? ''); const pago = extraerPago(json);
  const statusDetail = String(pago?.status_detail ?? json?.status_detail ?? '');
  const orderId = String(json?.id ?? ''); let paymentId = String(pago?.id ?? '');
  const pmFromOrder = pago?.payment_method ?? {};
  if (mpStatus === 'processed' || mpStatus === 'paid' || mpStatus === 'approved') {
    let last4 = (typeof pmFromOrder?.last_four_digits === 'string' && pmFromOrder.last_four_digits) || buscarLast4(json);
    let paymentMethodId = (typeof pmFromOrder?.id === 'string' && pmFromOrder.id) || (typeof pago?.payment_method_id === 'string' && pago.payment_method_id) || null;
    let installments = pmFromOrder?.installments != null ? Number(pmFromOrder.installments) : pago?.installments != null ? Number(pago.installments) : null;
    if (!last4 && orderId) {
      const extra = await consultarOrden(orderId);
      last4 = last4 ?? extra.last4; paymentMethodId = paymentMethodId ?? extra.paymentMethodId;
      installments = installments ?? extra.installments; paymentId = paymentId || extra.paymentId;
    }
    return { orderId, paymentId, mpStatus, statusDetail, paymentMethodId, last4, installments };
  }
  if (mpStatus === 'failed' || mpStatus === 'rejected') throw MPError.fromStatusDetail(statusDetail, json, 402);
  throw new MPError({ userMessage: traducirStatusDetail(statusDetail) || 'El pago quedó pendiente.', statusDetail, httpStatus: 402, technical: json });
}
