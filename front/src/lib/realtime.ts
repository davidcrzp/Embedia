import { REALTIME_URL } from './urls';
import type { Pedido } from './types';

function urlTiempoReal(): string { return REALTIME_URL; }

export type PedidoAdmin = Omit<Pedido, 'usuario'> & { usuario: { id: string; nombre: string; email: string } };
export type PedidoCreadoEvento = { pedido: PedidoAdmin; productos: { id: string; stock: number }[] };
export type RealtimeMsg = { tipo: 'pedido-creado'; data: PedidoCreadoEvento } | { tipo: 'resync' };

const SUBSCRIPTION = `subscription {
  pedidoCreado {
    pedido { id fecha total status metodoPago mpOrderId mpPaymentId mpPaymentMethod mpLast4 mpInstallments
      mpTicketUrl mpBarcode mpReference mpExpiresAt direccion lat lng
      usuario { id nombre email }
      detalles { id cantidad precio producto { id nombre imagen } } }
    productos { id stock }
  }
}`;

const listeners = new Set<(m: RealtimeMsg) => void>();
let contador = 0;

export function onRealtime(fn: (m: RealtimeMsg) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function emitir(m: RealtimeMsg) {
  if (m.tipo === 'pedido-creado') contador++;
  for (const fn of [...listeners]) { try { fn(m); } catch (e) { console.error('[realtime] listener falló:', e); } }
}

export async function sinCarreras<T>(fn: () => Promise<T>): Promise<T> {
  let antes: number; let r: T;
  do { antes = contador; r = await fn(); } while (antes !== contador);
  return r;
}

const esperar = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  });

function procesarBloque(bloque: string): boolean {
  let evento = 'message'; const datos: string[] = [];
  for (const linea of bloque.split('\n')) {
    if (linea.startsWith(':')) continue;
    if (linea.startsWith('event:')) evento = linea.slice(6).trim();
    else if (linea.startsWith('data:')) datos.push(linea.slice(5).replace(/^ /, ''));
  }
  if (evento !== 'next' || datos.length === 0) return false;
  let payload: any; try { payload = JSON.parse(datos.join('\n')); } catch { return false; }
  if (payload?.errors?.length) {
    const code = payload.errors[0]?.extensions?.code;
    console.warn('[realtime] Error de suscripción:', payload.errors[0]?.message);
    return code === 'UNAUTHENTICATED' || code === 'FORBIDDEN';
  }
  const ev = payload?.data?.pedidoCreado;
  if (ev) emitir({ tipo: 'pedido-creado', data: ev as PedidoCreadoEvento });
  return false;
}

export function iniciarTiempoReal(): () => void {
  const ac = new AbortController(); const { signal } = ac; const url = urlTiempoReal();
  (async () => {
    let conectadoAntes = false; let intento = 0;
    while (!signal.aborted) {
      try {
        const res = await fetch(url, {
          method: 'POST', credentials: 'include', signal,
          headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
          body: JSON.stringify({ query: SUBSCRIPTION }),
        });
        if (res.status === 401 || res.status === 403) return;
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        if (!(res.headers.get('content-type') ?? '').includes('text/event-stream')) return;
        intento = 0;
        if (conectadoAntes) emitir({ tipo: 'resync' });
        conectadoAntes = true;
        const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = '';
        for (;;) {
          const { done, value } = await reader.read(); if (done) break;
          buf = (buf + decoder.decode(value, { stream: true })).replace(/\r\n/g, '\n');
          let i: number;
          while ((i = buf.indexOf('\n\n')) >= 0) {
            const bloque = buf.slice(0, i); buf = buf.slice(i + 2);
            if (procesarBloque(bloque)) return;
          }
        }
      } catch (e) { if (signal.aborted) return; console.warn('[realtime] Conexión perdida, reintentando…', e); }
      await esperar(Math.min(1000 * 2 ** intento, 15000), signal); intento++;
    }
  })();
  return () => ac.abort();
}
