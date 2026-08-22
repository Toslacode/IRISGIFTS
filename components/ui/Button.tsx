'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { useGlassPointer } from '@/components/ui/useGlassPointer';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/* Every interactive control in the product is one of these. Min height 44px
   throughout, so nothing falls below the touch target floor.

   The surfaces are glass: a translucent fill over a blurred, slightly
   over-saturated backdrop, a bright rim along the top edge and a specular
   highlight that follows the pointer.

   The primary is champagne with navy type on it, not a near-black slab. On a
   cream page a dark button is the heaviest thing on the screen and drags the
   whole design toward an app; gold at 7.7:1 against the ink is every bit as
   legible and belongs to the room it is in. */
const base =
  'inline-flex items-center justify-center gap-2 rounded-pill ' +
  'font-medium cursor-pointer select-none text-center text-balance ' +
  /* min-w-0 so a long label wraps instead of widening a grid track past
     the viewport; py-2 keeps a wrapped label off the pill's edges. */
  'min-w-0 py-2 ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-250 ' +
  'ease-out-soft ' +
  /* Under 2px of travel: it registers as feedback, not as the layout moving. */
  'motion-safe:hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] ' +
  'disabled:cursor-not-allowed disabled:translate-y-0 disabled:active:scale-100';

const variants: Record<Variant, string> = {
  primary:
    'glass glass-gold border border-caramel/40 bg-gold text-ink shadow-glass-gold ' +
    'hover:border-caramel/55 hover:bg-gold-lit hover:shadow-glass-gold-lift ' +
    /* Disabled is a waiting state, not a broken one: a quiet cream chip
       rather than a greyed-out gold one. */
    'disabled:border-line disabled:bg-canvas-deep disabled:text-ink-faint ' +
    'disabled:shadow-none disabled:hover:bg-canvas-deep disabled:hover:border-line',
  secondary:
    'glass glass-warm bg-gold-wash/75 text-ink border border-gold-soft shadow-glass ' +
    'hover:border-gold hover:bg-gold-wash hover:shadow-glass-lift ' +
    'disabled:opacity-50 disabled:shadow-none disabled:hover:border-gold-soft ' +
    'disabled:hover:bg-gold-wash/75',
  ghost:
    'bg-transparent text-ink-soft border border-transparent ' +
    'hover:text-ink hover:border-line/70 hover:bg-surface/60 ' +
    'hover:backdrop-blur-md hover:backdrop-saturate-150 hover:shadow-glass ' +
    'disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-transparent ' +
    'disabled:hover:shadow-none',
  danger:
    'glass bg-danger-wash/75 text-danger border border-danger/15 shadow-glass ' +
    'hover:border-danger/40 hover:shadow-glass-lift ' +
    'disabled:opacity-50 disabled:shadow-none',
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
  const glass = useGlassPointer<HTMLButtonElement>();

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...glass}
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
  const glass = useGlassPointer<HTMLAnchorElement>();

  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...glass}
      {...props}
    >
      {children}
    </Link>
  );
}
