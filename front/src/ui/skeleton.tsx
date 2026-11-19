import { cn } from './cn';
import type { JSX } from 'preact';
export function Skeleton({ class: className, ...props }: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div class={cn('animate-pulse-soft rounded-sm bg-elevated', className)} {...props} />;
}
