import { currency, setCurrency, usdLoading, usdRate, usdRateIsFallback } from '../lib/currency';
import { cn } from '../ui/cn';
export default function CurrencySelector() {
  const current = currency.value;
  return (
    <div role="radiogroup" aria-label="Divisa del catálogo" class="inline-flex items-center overflow-hidden rounded-sm border border-border bg-background font-mono text-[10px] uppercase tracking-wider"
      title={usdRateIsFallback.value ? 'Tasa aproximada (API no disponible)' : `1 MXN = ${usdRate.value.toFixed(4)} USD`}>
      {(['MXN', 'USD'] as const).map((c) => {
        const active = current === c;
        const disabled = c === 'USD' && usdLoading.value && current !== 'USD';
        return (
          <button key={c} type="button" role="radio" aria-checked={active} onClick={() => setCurrency(c)} disabled={disabled}
            class={cn('px-3 py-1.5 transition-colors disabled:cursor-wait', active ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-elevated hover:text-foreground')}>
            {c}{c === 'USD' && usdRateIsFallback.value && active && (<span class="ml-1 text-[9px]">≈</span>)}
          </button>
        );
      })}
    </div>
  );
}
