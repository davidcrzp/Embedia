import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';
import type { JSX } from 'preact';
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40',
  { variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary-soft',
      outline: 'border border-border bg-transparent hover:border-border-strong hover:bg-elevated',
      ghost: 'hover:bg-elevated', subtle: 'bg-elevated hover:bg-border',
      destructive: 'bg-destructive text-white hover:bg-destructive/90',
    },
    size: { default: 'h-9 px-4 text-sm', sm: 'h-8 px-3 text-xs', lg: 'h-11 px-6 text-sm', icon: 'h-9 w-9' },
  }, defaultVariants: { variant: 'default', size: 'default' } },
);
export interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export function Button({ class: className, variant, size, ...props }: ButtonProps) {
  return <button class={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
