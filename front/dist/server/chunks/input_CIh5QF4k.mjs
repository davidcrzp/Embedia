import { b as cn } from './Footer_BKSbCEz3.mjs';
import { jsx } from 'preact/jsx-runtime';

function Input({
  class: className,
  ...props
}) {
  return jsx("input", {
    class: cn("flex h-9 w-full rounded-sm border border-border bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50", className),
    ...props
  });
}

export { Input as I };
