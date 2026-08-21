import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/* Every interactive control in the product is one of these. Min height 44px
   throughout, so nothing falls below the touch target floor. */
const base =
  'inline-flex items-center justify-center gap-2 rounded-pill ' +
  'font-medium cursor-pointer select-none text-center text-balance ' +
  /* min-w-0 so a long label wraps instead of widening a grid track past
     the viewport; py-2 keeps a wrapped label off the pill's edges. */
  'min-w-0 py-2 ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-200 ' +
  'ease-out-soft active:scale-[0.985] ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-canvas shadow-soft hover:bg-[#232741] ' +
    'hover:shadow-lift disabled:hover:bg-ink disabled:hover:shadow-soft',
  secondary:
    'bg-surface text-ink border border-line-strong hover:border-gold ' +
    'hover:bg-gold-wash disabled:hover:border-line-strong disabled:hover:bg-surface',
  ghost:
    'bg-transparent text-ink-soft hover:text-ink hover:bg-canvas-deep',
  danger:
    'bg-danger-wash text-danger border border-transparent hover:border-danger/40',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-12 px-6 text-[0.975rem]',
  lg: 'min-h-14 px-8 text-lg',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: CommonProps & ComponentProps<'button'>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
