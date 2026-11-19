import { useEffect, useRef, useState } from 'preact/hooks';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
export type AddressValue = { text: string; lat: number | null; lng: number | null };
type Suggestion = { display_name: string; lat: number; lng: number };
type Props = { value: AddressValue; onChange: (v: AddressValue) => void; label?: string };
const MIN_CHARS = 3;
const DEBOUNCE_MS = 400;
const GEO_TIMEOUT_MS = 8000;
export default function AddressAutocomplete({ value, onChange, label = 'Dirección de entrega' }: Props) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilling, setPrefilling] = useState(false);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triedGeolocationRef = useRef(false);

  async function fetchSearch(q: string, signal: AbortSignal): Promise<Suggestion[]> {
    const params = new URLSearchParams({ q, format: 'json', addressdetails: '1', limit: '5', countrycodes: 'mx', 'accept-language': 'es' });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((r: any) => ({ display_name: String(r.display_name ?? ''), lat: Number(r.lat), lng: Number(r.lon) }));
  }
  async function fetchReverse(lat: number, lng: number): Promise<Suggestion | null> {
    try {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lng), format: 'json', 'accept-language': 'es', zoom: '18', addressdetails: '1' });
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.display_name) return null;
      return { display_name: String(data.display_name), lat, lng };
    } catch { return null; }
  }
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = value.text.trim();
    if (q.length < MIN_CHARS) { setSuggestions([]); setLoading(false); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true); setError(null);
      try {
        const result = await fetchSearch(q, ac.signal);
        if (!ac.signal.aborted) setSuggestions(result);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError('No se pudo buscar. Escribe la dirección manualmente.');
        setSuggestions([]);
      } finally { if (!ac.signal.aborted) setLoading(false); }
    }, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value.text]);

  async function tryGeolocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setPrefillError('Tu navegador no soporta geolocalización.'); return; }
    if (value.text.trim().length > 0) return;
    setPrefilling(true); setPrefillError(null);
    const timer = setTimeout(() => { setPrefilling(false); setPrefillError('No se pudo detectar tu ubicación automáticamente.'); }, GEO_TIMEOUT_MS);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timer);
        const { latitude, longitude } = pos.coords;
        const suggestion = await fetchReverse(latitude, longitude);
        setPrefilling(false);
        if (!suggestion) { setPrefillError('No pudimos geocodificar tu ubicación. Escribe tu dirección.'); return; }
        onChange({ text: suggestion.display_name, lat: suggestion.lat, lng: suggestion.lng });
      },
      (err) => {
        clearTimeout(timer);
        setPrefilling(false);
        if (err.code === err.PERMISSION_DENIED) setPrefillError('Permiso de ubicación denegado. Escribe tu dirección.');
        else setPrefillError('No pudimos obtener tu ubicación. Escribe tu dirección.');
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 300000 },
    );
  }
  useEffect(() => {
    if (triedGeolocationRef.current) return;
    if (value.text.trim().length > 0) return;
    if (value.lat !== null && value.lng !== null) return;
    triedGeolocationRef.current = true;
    void tryGeolocation();
  }, []);
  const pick = (s: Suggestion) => { onChange({ text: s.display_name, lat: s.lat, lng: s.lng }); setSuggestions([]); setFocused(false); setPrefillError(null); };
  return (
    <div class="space-y-2">
      <Label for="checkout-dir">{label}</Label>
      <Input id="checkout-dir" type="text" autocomplete="street-address" value={value.text}
        onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
        onInput={(e) => onChange({ text: (e.target as HTMLInputElement).value, lat: null, lng: null })}
        placeholder="Calle, número, colonia, ciudad" />
      {prefilling && (<div class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted"><span class="h-3 w-3 animate-spin rounded-full border border-border border-t-primary" />Detectando tu ubicación…</div>)}
      {value.lat !== null && value.lng !== null && !prefilling && (<p class="font-mono text-[10px] uppercase tracking-wider text-success">✓ Dirección validada en OpenStreetMap</p>)}
      {prefillError && !prefilling && value.text.trim().length === 0 && (
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-[11px] text-muted">{prefillError}</p>
          <button type="button" onClick={() => { triedGeolocationRef.current = false; void tryGeolocation(); }} class="font-mono text-[10px] uppercase tracking-wider text-primary underline underline-offset-2 hover:text-primary-soft">📍 Usar mi ubicación</button>
        </div>
      )}
      {focused && suggestions.length > 0 && (
        <ul class="max-h-56 overflow-y-auto rounded-sm border border-border bg-elevated">
          {suggestions.map((s, i) => (<li key={`${s.lat}-${s.lng}-${i}`}><button type="button" onMouseDown={(e) => { e.preventDefault(); pick(s); }} class="block w-full px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-surface">{s.display_name}</button></li>))}
        </ul>
      )}
      {focused && loading && (<div class="flex items-center gap-2 text-[10px] uppercase text-muted"><span class="h-3 w-3 animate-spin rounded-full border border-border border-t-primary" />Buscando…</div>)}
      {error && <p class="text-xs text-destructive">{error}</p>}
    </div>
  );
}
