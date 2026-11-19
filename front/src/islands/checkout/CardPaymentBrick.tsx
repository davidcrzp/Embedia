import { useEffect, useRef, useState } from 'preact/hooks';
import type { CartItem } from '../../lib/types';
declare global { interface Window { MercadoPago: any } }
type Resultado = { pedidoId: number; status: string; mpPaymentId?: string; last4?: string | null; installments?: number | null };
type AddressPayload = { direccion?: string | null; lat?: number | null; lng?: number | null };
type Props = { amount: number; items: CartItem[]; payerEmail: string; address?: AddressPayload | null; onSuccess: (r: Resultado) => void; onError: (msg: string) => void; onClearError: () => void; };
const CONTENEDOR_ID = 'cardPaymentBrick_container';
const READY_TIMEOUT_MS = 12000;
let mpSdkPromise: Promise<void> | null = null;
function loadMercadoPagoSDK(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  if (mpSdkPromise) return mpSdkPromise;
  mpSdkPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://sdk.mercadopago.com/js/v2';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar el SDK de Mercado Pago.'));
    document.head.appendChild(s);
  });
  return mpSdkPromise;
}
export default function CardPaymentBrick({ amount, items, payerEmail, address = null, onSuccess, onError, onClearError }: Props) {
  const controllerRef = useRef<any>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [errorInterno, setErrorInterno] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    let readyTimer: ReturnType<typeof setTimeout> | null = null;
    const marcarError = (msg: string) => { if (cancelled) return; setErrorInterno(msg); setEstado('error'); onError(msg); };
    const limpiarTimer = () => { if (readyTimer) { clearTimeout(readyTimer); readyTimer = null; } };
    const init = async () => {
      const publicKey = String(import.meta.env.PUBLIC_MP_PUBLIC_KEY ?? '').trim();
      if (!publicKey || publicKey.includes('00000000')) { marcarError('La configuración de pagos no está completa.'); return; }
      try { await loadMercadoPagoSDK(); } catch { marcarError('No se pudo cargar el módulo de pago seguro.'); return; }
      let tries = 0;
      while (!document.getElementById(CONTENEDOR_ID) && tries < 100) { await new Promise((r) => setTimeout(r, 30)); tries++; }
      const container = document.getElementById(CONTENEDOR_ID); if (!container) { marcarError('No se pudo inicializar el formulario.'); return; }
      container.innerHTML = ''; if (cancelled) return;
      readyTimer = setTimeout(() => {
        if (cancelled) return;
        if ((document.getElementById(CONTENEDOR_ID)?.childElementCount ?? 0) === 0) marcarError('No se pudo cargar el formulario de pago. Si estás en ventana privada, el navegador bloquea cookies de terceros que el SDK necesita.');
      }, READY_TIMEOUT_MS);
      try {
        const mp = new window.MercadoPago(publicKey, { locale: 'es-MX', advancedFraudPrevention: false });
        const bricksBuilder = await mp.bricks();
        controllerRef.current = await bricksBuilder.create('cardPayment', CONTENEDOR_ID, {
          initialization: { amount: Math.max(1, Number(amount) || 1), payer: { email: payerEmail } },
          customization: {
            visual: { style: { theme: 'default', customVariables: { baseColor: '#171717', baseColorFirstVariant: '#404040', baseColorSecondVariant: '#262626', textPrimaryColor: '#0a0a0a', textSecondaryColor: '#525252', inputBackgroundColor: '#ffffff', inputFocusedBorderColor: '#171717', buttonBackgroundColor: '#171717', buttonTextColor: '#ffffff', borderRadiusMedium: '4px', borderRadiusLarge: '6px' } } },
            paymentMethods: { minInstallments: 1, maxInstallments: 12, types: { exclude: ['ticket', 'atm', 'bank_transfer', 'prepaid_card', 'digital_currency', 'digital_wallet', 'voucher_card', 'crypto_transfer'] } },
          },
          callbacks: {
            onReady: () => { limpiarTimer(); setEstado('listo'); setErrorInterno(null); },
            onSubmit: (formData: any) => new Promise<void>(async (resolve, reject) => {
              onClearError();
              try {
                const payload = { items: items.map((i) => ({ id: i.producto.id, cantidad: i.cantidad })), token: formData.token, payment_method_id: formData.payment_method_id, installments: Number(formData.installments ?? 1), payer: { email: String(formData?.payer?.email ?? payerEmail), identification: formData?.payer?.identification ?? undefined }, direccion: address?.direccion ?? null, lat: address?.lat ?? null, lng: address?.lng ?? null };
                const res = await fetch('/api/checkout/process-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
                const data = await res.json().catch(() => ({})); if (!res.ok) { const msg = String(data?.error ?? 'El pago no se pudo procesar.'); onError(msg); reject(new Error(msg)); return; }
                onSuccess(data); resolve();
              } catch (err: any) { const msg = String(err?.message ?? 'No pudimos conectar con el servidor de pagos.'); onError(msg); reject(new Error(msg)); }
            }),
            onError: () => { limpiarTimer(); marcarError('Hubo un problema con el formulario de pago.'); },
          },
        });
      } catch (e: any) { limpiarTimer(); marcarError('No se pudo inicializar el formulario de pago.'); }
    };
    init();
    return () => { cancelled = true; limpiarTimer(); try { controllerRef.current?.unmount?.(); } catch {} };
  }, [amount, payerEmail, address?.direccion, address?.lat, address?.lng]);
  return (
    <div class="overflow-hidden rounded-md border border-neutral-400 bg-neutral-200 shadow-lg" onInput={onClearError} onClick={onClearError}>
      <div class="flex items-center gap-3 border-b border-neutral-300 bg-neutral-100 px-5 py-3"><span class="grid h-9 w-9 place-items-center rounded-full bg-neutral-800 text-base text-white" aria-hidden="true">🔒</span><div class="min-w-0"><p class="text-sm font-bold text-neutral-900">Pago seguro con tarjeta</p><p class="font-mono text-[11px] uppercase tracking-wider text-neutral-600">Procesado por Mercado Pago</p></div></div>
      <div class="px-5 py-5">
        {estado === 'cargando' && !errorInterno && <div class="flex items-center gap-3 py-6"><span class="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-800" /><span class="font-mono text-xs uppercase tracking-wider text-neutral-600">Cargando formulario seguro…</span></div>}
        {estado === 'error' && errorInterno && <div class="rounded-sm border-l-4 border-destructive bg-destructive/5 px-3 py-3 text-sm text-neutral-800"><p class="font-mono text-[10px] uppercase tracking-wider text-destructive">Módulo de pago no disponible</p><p class="mt-1">{errorInterno}</p></div>}
        <div id={CONTENEDOR_ID} class="min-h-[60px]" />
      </div>
      <div class="border-t border-neutral-300 bg-neutral-100 px-5 py-3"><p class="font-mono text-[10px] uppercase tracking-wider text-neutral-600">🔒 Tus datos viajan encriptados a Mercado Pago.</p></div>
    </div>
  );
}
