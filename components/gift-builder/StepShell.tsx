'use client';

import type { ReactNode } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getStep, stepIds } from '@/lib/steps';
import { cn } from '@/lib/utils';

/* ==========================================================================
   One question per screen: heading, the answer surface, then navigation.

   The continue button is disabled until the question is answered, and it
   explains why rather than leaving the customer guessing.
   ========================================================================== */

interface StepShellProps {
  children: ReactNode;
  /** Replaces the default "המשך" label. */
  nextLabel?: string;
  /** Overrides what Continue does — used by the recommendation screen. */
  onNext?: () => void;
  /** Shown under the buttons when the step can be left unanswered. */
  skipLabel?: string;
  onSkip?: () => void;
  /** Hides the footer entirely, for screens with their own actions. */
  hideNav?: boolean;
  /** Message under a disabled Continue. */
  blockedHint?: string;
  wide?: boolean;
}

export function StepShell({
  children,
  nextLabel = 'המשך',
  onNext,
  skipLabel,
  onSkip,
  hideNav = false,
  blockedHint,
  wide = false,
}: StepShellProps) {
  const { step, next, back, canContinue, direction } = useBuilder();
  const definition = getStep(step);
  const isFirst = stepIds.indexOf(step) === 0;

  return (
    <div
      /* Keyed on the step so React remounts and replays the entrance */
      key={step}
      className={cn(
        'flex w-full flex-col gap-8',
        wide ? 'max-w-5xl' : 'max-w-3xl',
        'mx-auto'
      )}
    >
      <header
        className="anim-rise flex flex-col gap-2 text-center"
        style={
          {
            '--d': 0,
            /* Entering backwards, slide in from the other side */
            animationName: direction === 1 ? undefined : 'iris-fade',
          } as React.CSSProperties
        }
      >
        <h1 className="text-title">{definition.title}</h1>
        {definition.subtitle && (
          <p className="text-lg text-ink-muted">{definition.subtitle}</p>
        )}
      </header>

      <div
        className="anim-rise"
        style={{ '--d': 1 } as React.CSSProperties}
      >
        {children}
      </div>

      {!hideNav && (
        <footer
          className="anim-rise flex flex-col gap-4"
          style={{ '--d': 2 } as React.CSSProperties}
        >
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              onClick={back}
              disabled={isFirst}
              className="sm:min-w-32"
            >
              <Icon name="arrow-right" size={18} />
              חזרה
            </Button>

            <div className="flex flex-col gap-2 sm:items-end">
              <Button
                onClick={onNext ?? next}
                disabled={!canContinue}
                size="lg"
                className="w-full sm:w-auto sm:min-w-44"
              >
                {nextLabel}
                <Icon name="arrow-left" size={18} />
              </Button>
            </div>
          </div>

          {/* Gentle, never aggressive — a hint, not an error */}
          {!canContinue && blockedHint && (
            <p
              className="text-center text-[0.875rem] text-ink-muted sm:text-end"
              aria-live="polite"
            >
              {blockedHint}
            </p>
          )}

          {skipLabel && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="mx-auto min-h-11 cursor-pointer rounded-pill px-4 text-[0.9375rem] text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-ink"
            >
              {skipLabel}
            </button>
          )}
        </footer>
      )}
    </div>
  );
}
