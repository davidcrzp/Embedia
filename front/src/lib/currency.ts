import { signal, computed } from '@preact/signals';

export type Currency = 'MXN' | 'USD';

const FALLBACK_USD_RATE = 0.058;
const CACHE_KEY = 'embedia-usd-rate-v2';
const PREF_KEY  = 'embedia-currency';
const CACHE_TTL_MS = 60 * 60 * 1000;

export const currency = signal<Currency>('MXN');
export const usdRateRaw = signal<number | null>(null);
export const usdLoading = signal(false);
export const usdRate = computed(() => usdRateRaw.value ?? FALLBACK_USD_RATE);
export const usdRateIsFallback = computed(() => usdRateRaw.value === null);

function readCurrencyPref(): Currency {
  if (typeof window === 'undefined') return 'MXN';
  try { return localStorage.getItem(PREF_KEY) === 'USD' ? 'USD' : 'MXN'; }
  catch { return 'MXN'; }
}
function persistCurrency(c: Currency) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(PREF_KEY, c); } catch {}
}
function readCachedRate(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const rate = Number(parsed?.rate);
    if (Number.isFinite(rate) && rate > 0.001 && rate < 1) return rate;
    return null;
  } catch { return null; }
}
function cacheIsFresh(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return typeof parsed?.ts === 'number' && Date.now() - parsed.ts < CACHE_TTL_MS;
  } catch { return false; }
}
function persistRate(rate: number) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, ts: Date.now() })); } catch {}
}

const ENDPOINTS = [
  'https://api.frankfurter.app/latest?from=MXN&to=USD',
  'https://api.frankfurter.dev/v1/latest?base=MXN&symbols=USD',
];

async function fetchRate(): Promise<number | null> {
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      const data: any = await res.json();
      const raw = data?.rates?.USD ?? data?.USD;
      const rate = Number(raw);
      if (Number.isFinite(rate) && rate > 0.001 && rate < 1) return rate;
    } catch { /* siguiente endpoint */ }
  }
  return null;
}

export async function ensureUsdRate(force = false): Promise<void> {
  if (typeof window === 'undefined') return;
  if (usdLoading.value) return;
  if (!force && usdRateRaw.value !== null && cacheIsFresh()) return;
  usdLoading.value = true;
  try {
    const rate = await fetchRate();
    if (rate !== null) {
      usdRateRaw.value = rate;
      persistRate(rate);
    } else {
      console.warn('[currency] Frankfurter no respondió; usando tasa de respaldo:', FALLBACK_USD_RATE);
    }
  } finally {
    usdLoading.value = false;
  }
}

/**
 * Restaura preferencia de divisa + tasa cacheada desde localStorage.
 * Se llama en un useEffect (DESPUÉS de la hidratación) para:
 *   1. Que el HTML SSR y el primer render cliente coincidan (MXN) — sin mismatch.
 *   2. Que el cambio de signal a USD (si aplica) SÍ dispare re-render en
 *      CurrencySelector, HomeView, CartSummary, etc. (antes el signal ya era
 *      USD desde el module load, por lo que Preact no re-renderizaba y el
 *      selector quedaba "atascado" en MXN aunque los precios sí cambiaban).
 */
export function initCurrency() {
  if (typeof window === 'undefined') return;

  // 1. Aplicar preferencia guardada (si difiere de 'MXN' dispara re-render)
  const saved = readCurrencyPref();
  if (currency.value !== saved) currency.value = saved;

  // 2. Aplicar tasa cacheada inmediatamente (aunque esté vencida) para que
  //    el indicador ≈ no parpadee mientras se refresca en background.
  if (usdRateRaw.value === null) {
    const cached = readCachedRate();
    if (cached !== null) usdRateRaw.value = cached;
  }

  // 3. Refrescar en background si la cache no es fresca (o no existe).
  //    ensureUsdRate() ya hace la comprobación y respeta el flag de loading.
  void ensureUsdRate();
}

export function setCurrency(c: Currency) {
  currency.value = c;
  persistCurrency(c);
  if (c === 'USD') void ensureUsdRate();
}
