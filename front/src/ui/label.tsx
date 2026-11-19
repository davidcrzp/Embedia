import { cn } from './cn';
import type { JSX } from 'preact';
export function Label({ class: className, ...props }: JSX.HTMLAttributes<HTMLLabelElement>) {
  return <label class={cn('text-label font-medium uppercase text-muted', className)} {...props} />;
}
