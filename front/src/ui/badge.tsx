import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';
import type { JSX } from 'preact';
const badgeVariants = cva('inline-flex items-center rounded-sm px-1.5 py-0.5 text-label font-medium uppercase', {
  variants: { variant: {
    default: 'bg-primary text-primary-foreground', outline: 'border border-border text-muted',
    solid: 'bg-elevated text-foreground', muted: 'bg-surface text-muted',
    destructive: 'border border-destructive/40 text-destructive',
    success: 'border border-success/40 text-success',
  } }, defaultVariants: { variant: 'outline' },
});
export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ class: className, variant, ...props }: BadgeProps) {
  return <span class={cn(badgeVariants({ variant }), className)} {...props} />;
}
