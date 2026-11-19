const TRADUCCIONES: Record<string, string> = {
  pending_waiting_payment: 'Tu pago quedó pendiente de confirmación.',
  cc_rejected_call_for_authorize: 'Tu banco requiere autorización.',
  cc_rejected_insufficient_amount: 'La tarjeta no tiene fondos suficientes.',
  cc_rejected_bad_filled_form: 'Revisa los datos del formulario.',
  cc_rejected_bad_filled_card_number: 'El número de tarjeta es incorrecto.',
  cc_rejected_bad_filled_date: 'La fecha de vencimiento es incorrecta.',
  cc_rejected_bad_filled_security_code: 'El código de seguridad es incorrecto.',
};
const ALIAS_SANDBOX: Record<string, string> = {
  APRO: 'accredited', CONT: 'pending_waiting_payment', CALL: 'cc_rejected_call_for_authorize',
  FUND: 'cc_rejected_insufficient_amount', FORM: 'cc_rejected_bad_filled_form',
  OTHE: 'cc_rejected_other_reason', SECU: 'cc_rejected_bad_filled_security_code',
  EXPI: 'cc_rejected_bad_filled_date',
};
const GENERICO = 'El pago no se pudo procesar.';
const RED = 'No pudimos conectar con el servicio de pagos.';
export function traducirStatusDetail(detail: string | undefined | null): string {
  if (!detail) return GENERICO;
  const normalizado = ALIAS_SANDBOX[detail.toUpperCase()] ?? detail;
  return TRADUCCIONES[normalizado] ?? GENERICO;
}
export class MPError extends Error {
  userMessage: string; statusDetail: string; httpStatus: number; technical: any;
  constructor(opts: { userMessage: string; statusDetail?: string; httpStatus: number; technical?: any }) {
    super(opts.userMessage);
    this.name = 'MPError'; this.userMessage = opts.userMessage;
    this.statusDetail = opts.statusDetail ?? ''; this.httpStatus = opts.httpStatus; this.technical = opts.technical;
  }
  static red() { return new MPError({ userMessage: RED, httpStatus: 502 }); }
  static fromStatusDetail(detail: string, technical: any, httpStatus = 402) {
    return new MPError({ userMessage: traducirStatusDetail(detail), statusDetail: detail, httpStatus, technical });
  }
}
export function esErrorCredencialesOxxo(json: any): boolean {
  const cause = json?.cause;
  if (!Array.isArray(cause)) return false;
  return cause.some((c: any) => c?.code === 7 || /Unauthorized use of live credentials/i.test(String(c?.description ?? '')));
}
export function mensajeCredencialesOxxo(): string {
  return 'El método de pago OXXO no está disponible con las credenciales actuales de Mercado Pago. ' +
    'En sandbox se requiere el Access Token de una CUENTA DE PRUEBA (test user), no el de tu app personal.';
}
