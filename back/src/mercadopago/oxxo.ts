import { MP_API, getAccessToken } from './config';
import { MPError, traducirStatusDetail, esErrorCredencialesOxxo, mensajeCredencialesOxxo } from './errors';
export type CrearOxxoInput = { total: number; payerEmail: string; payerFirstName: string; payerLastName: string; externalReference?: string; description?: string; notificationUrl?: string; };
export type CrearOxxoResult = { orderId: string; paymentId: string; mpStatus: string; statusDetail: string; ticketUrl: string; barcode: string; reference: string; expiresAt: string; verificationCode: string | null; };
function primerPago(json: any): any { return json?.transactions?.payments?.[0] ?? json?.payments?.[0] ?? json?.payment ?? {}; }
function extraerTicket(pm: any, pago: any, orden: any) {
  const url = [pm?.ticket_url, pm?.external_resource_url, pago?.ticket_url, pago?.external_resource_url, pago?.transaction_details?.external_resource_url, orden?.transaction_details?.external_resource_url].find((v) => typeof v === 'string' && v.length > 0) ?? '';
  const barcode = [pm?.barcode_content, pm?.barcode?.content, pago?.barcode_content, pago?.barcode?.content, pago?.transaction_details?.barcode?.content, orden?.transaction_details?.barcode?.content].find((v) => typeof v === 'string' && v.length > 0) ?? '';
  const reference = [pm?.reference, pm?.payment_method_reference_id, pago?.reference, pago?.payment_method_reference_id, pago?.transaction_details?.payment_method_reference_id, pago?.payment_reference, orden?.payment_reference].find((v) => typeof v === 'string' && v.length > 0) ?? '';
  const verificationCode = [pm?.verification_code, pago?.verification_code, pago?.transaction_details?.verification_code].find((v) => typeof v === 'string' && v.length > 0) || null;
  return { url, barcode, reference, verificationCode };
}
function calcularVencimiento(pm: any, pago: any, orden: any): string {
  const raw = [pm?.date_of_expiration, pago?.date_of_expiration, pago?.transaction_details?.date_of_expiration, orden?.date_of_expiration].find((v) => typeof v === 'string' && v.length > 0);
  if (typeof raw === 'string') return raw;
  const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString();
}
export async function crearPagoOxxo(input: CrearOxxoInput): Promise<CrearOxxoResult> {
  const totalStr = Number(input.total).toFixed(2);
  const body: any = {
    type: 'online', total_amount: totalStr, external_reference: input.externalReference ?? crypto.randomUUID(),
    payer: { email: input.payerEmail, first_name: input.payerFirstName || 'Cliente', last_name: input.payerLastName || 'Embedia' },
    transactions: { payments: [{ amount: totalStr, payment_method: { id: 'oxxo', type: 'ticket' } }] },
  };
  let res: Response;
  try {
    res = await fetch(`${MP_API}/v1/orders`, { method: 'POST', headers: { Authorization: `Bearer ${getAccessToken()}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  } catch (e: any) { console.error('[MP][OXXO] Error de red:', e?.message); throw MPError.red(); }
  const json: any = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && esErrorCredencialesOxxo(json)) throw new MPError({ userMessage: mensajeCredencialesOxxo(), statusDetail: 'unauthorized_live_credentials', httpStatus: 401, technical: json });
    throw new MPError({ userMessage: 'No pudimos generar tu ticket OXXO.', httpStatus: 502, technical: json });
  }
  const mpStatus = String(json?.status ?? ''); const pago = primerPago(json); const pm = pago?.payment_method ?? {};
  const statusDetail = String(pago?.status_detail ?? json?.status_detail ?? 'waiting_payment');
  if (mpStatus === 'failed' || mpStatus === 'canceled') throw MPError.fromStatusDetail(statusDetail || 'rejected', json, 402);
  const orderId = String(json?.id ?? ''); const paymentId = String(pago?.id ?? '');
  const { url, barcode, reference, verificationCode } = extraerTicket(pm, pago, json);
  const expiresAt = calcularVencimiento(pm, pago, json);
  return { orderId, paymentId, mpStatus, statusDetail: statusDetail || 'waiting_payment', ticketUrl: url, barcode, reference, expiresAt, verificationCode };
}
export function traducirEstadoOxxo(detail: string): string { return traducirStatusDetail(detail); }
