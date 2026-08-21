'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import type { PastelTone } from '@/types';

/* ==========================================================================
   The selectable card the whole builder is made of.

   Rendered as a real <button> so it is keyboard-reachable, announces its
   pressed state, and the entire surface is the hit target.
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
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group relative flex min-h-[7.5rem] w-full cursor-pointer flex-col items-center justify-center',
        'gap-3 rounded-card border px-4 py-6 text-center',
        'transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out-soft',
        'hover:-translate-y-0.5 active:translate-y-0',
        selected
          ? 'border-gold bg-gold-wash shadow-gold'
          : 'border-line bg-surface shadow-soft hover:border-gold-soft hover:shadow-lift',
        emphasis && !selected && 'border-gold-soft bg-[#fdf9f1]',
        className
      )}
    >
      {/* Selection tick — the unmistakable "this one is chosen" signal */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute start-3 top-3 flex size-6 items-center justify-center rounded-full',
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
            'flex size-14 items-center justify-center rounded-full transition-colors duration-200',
            selected ? 'bg-white/80 text-gold-deep' : TONE_CLASS[tone],
            !selected && 'text-ink-soft'
          )}
        >
          {icon}
        </span>
      )}

      <span className="flex flex-col gap-1">
        <span
          className={cn(
            'font-display text-[1.0625rem] font-semibold leading-snug',
            selected ? 'text-ink' : 'text-ink'
          )}
        >
          {label}
        </span>
        {hint && (
          <span className="text-[0.8125rem] leading-snug text-ink-muted">
            {hint}
          </span>
        )}
      </span>

      {children}
    </button>
  );
}
