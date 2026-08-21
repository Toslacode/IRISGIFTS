'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { Icon, type IconName } from '@/components/ui/Icon';
import { includeCategories } from '@/data/taxonomy';
import { cn } from '@/lib/utils';
import type { CategoryId } from '@/types';

const ICONS: Record<CategoryId, IconName> = {
  towels: 'towel',
  robe: 'robe',
  skincare: 'cream',
  candles: 'candle',
  sweets: 'chocolate',
  wine: 'wine',
  homeware: 'cup',
  judaica: 'scroll',
  personalized: 'tag',
};

export function IncludeStep() {
  const { state, dispatch } = useBuilder();

  return (
    <StepShell blockedHint="בחרו לפחות פריט אחד, או תנו לנו לבחור">
      <div className="flex flex-col gap-5">
        <div
          role="group"
          aria-label="מה חשוב שיהיה במארז"
          className="stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3"
        >
          {includeCategories.map((option) => (
            <ChoiceCard
              key={option.id}
              label={option.label}
              tone={option.tone}
              role="checkbox"
              selected={state.includeCategories.includes(option.id)}
              icon={<Icon name={ICONS[option.id]} size={26} />}
              onSelect={() =>
                dispatch({ type: 'toggleCategory', value: option.id })
              }
            />
          ))}
        </div>

        {/* The escape hatch, given slightly more presence than the grid —
            it is the honest answer for most customers. */}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.surpriseMe}
          onClick={() =>
            dispatch({ type: 'setSurpriseMe', value: !state.surpriseMe })
          }
          className={cn(
            'flex min-h-16 w-full cursor-pointer items-center gap-4 rounded-card border px-5 py-4 text-start',
            'transition-[border-color,background-color,box-shadow] duration-200 ease-out-soft',
            state.surpriseMe
              ? 'border-gold bg-gold-wash shadow-gold'
              : 'border-gold-soft bg-[#fdf9f1] shadow-soft hover:border-gold hover:shadow-lift'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
              state.surpriseMe
                ? 'bg-gold text-white'
                : 'bg-gold-wash text-gold-deep'
            )}
          >
            <Icon
              name={state.surpriseMe ? 'check' : 'sparkle'}
              size={20}
              strokeWidth={state.surpriseMe ? 2.4 : 1.5}
            />
          </span>

          <span className="flex flex-col gap-0.5">
            <span className="font-display text-[1.0625rem] font-semibold text-ink">
              לא משנה לי, תבחרו בשבילי
            </span>
            <span className="text-[0.875rem] leading-snug text-ink-muted">
              נרכיב מארז מאוזן לפי האדם, האירוע והתקציב
            </span>
          </span>
        </button>
      </div>
    </StepShell>
  );
}
