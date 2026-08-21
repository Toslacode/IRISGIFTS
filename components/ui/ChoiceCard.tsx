'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/components/ui/Icon';
import { useGlassPointer } from '@/components/ui/useGlassPointer';
import { cn } from '@/lib/utils';
import type { PastelTone } from '@/types';

/* ==========================================================================
   The selectable card the whole builder is made of.

   Rendered as a real <button> so it is keyboard-reachable, announces its
   pressed state, and the entire surface is the hit target.

   It is glass, like the rest of the controls: the cream ground reads faintly
   through it and a champagne highlight tracks the pointer across the face.
   That is the whole "which of these am I about to pick" signal on a screen
   of eight near-identical cards.
   ========================================================================== */

const TONE_CLASS: Record<PastelTone, string> = {
  sage: 'bg-pastel-sage',
  sky: 'bg-pastel-sky',
  sand: 'bg-pastel-sand',
  rose: 'bg-pastel-rose',
  lilac: 'bg-pastel-lilac',
  mint: 'bg-pastel-mint',
};

interface ChoiceCardProps {
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
  /** Rendered inside the pastel halo. */
  icon?: ReactNode;
  tone?: PastelTone;
  /** `checkbox` for multi-select questions — changes what's announced. */
  role?: 'radio' | 'checkbox';
  /** Nudges the card visually without shouting. */
  emphasis?: boolean;
  className?: string;
  children?: ReactNode;
}

export function ChoiceCard({
  label,
  hint,
  selected,
  onSelect,
  icon,
  tone = 'sand',
  role = 'radio',
  emphasis = false,
  className,
  children,
}: ChoiceCardProps) {
  const glass = useGlassPointer<HTMLButtonElement>();

  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      {...glass}
      className={cn(
        /* Phones lay the card out as a row — icon beside label — which is
           ~20px shorter per option than the stacked version. Across a
           ten-option question that is the difference between the whole
           screen fitting an iPhone and not. The stacked card returns from
           the small breakpoint up. */
        'glass glass-warm',
        'group relative flex w-full cursor-pointer items-center justify-start',
        'min-h-[3.25rem] gap-2.5 rounded-card border px-3 py-2 text-start',
        'sm:min-h-[7.5rem] sm:flex-col sm:justify-center sm:gap-3 sm:px-4 sm:py-6 sm:text-center',
        'transition-[border-color,background-color,box-shadow,transform] duration-250 ease-out-soft',
        'motion-safe:hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
        selected
          ? 'border-gold bg-gold-wash/85 shadow-gold'
          : 'border-line bg-surface/72 shadow-glass hover:border-gold-soft hover:shadow-glass-lift',
        emphasis && !selected && 'border-gold-soft bg-[#fdf9f1]/80',
        className
      )}
    >
      {/* Selection tick — the unmistakable "this one is chosen" signal */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute end-1.5 top-1.5 flex size-5 items-center justify-center rounded-full',
          'sm:end-auto sm:start-3 sm:top-3 sm:size-6',
          'transition-[opacity,transform] duration-200 ease-out-soft',
          selected
            ? 'scale-100 bg-gold text-white opacity-100'
            : 'scale-75 opacity-0'
        )}
      >
        <Icon name="check" size={14} strokeWidth={2.4} />
      </span>

      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 sm:size-14',
            '[&_svg]:size-[18px] sm:[&_svg]:size-[26px]',
            selected ? 'bg-white/80 text-gold-deep' : TONE_CLASS[tone],
            !selected && 'text-ink-soft'
          )}
        >
          {icon}
        </span>
      )}

      <span className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <span className="font-display text-[0.875rem] font-semibold leading-tight text-ink sm:text-[1.0625rem] sm:leading-snug">
          {label}
        </span>
        {hint && (
          <span className="hidden text-[0.8125rem] leading-snug text-ink-muted sm:block">
            {hint}
          </span>
        )}
      </span>

      {children}
    </button>
  );
}
