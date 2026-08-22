'use client';

import type { ReactNode } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getStep, stepIds } from '@/lib/steps';
import { cn } from '@/lib/utils';

/* ==========================================================================
   One question per screen: heading, the answer surface, then navigation.

   Three things keep this from feeling like a web page and start it feeling
   like an app.

   The reserved height below: every question occupies the same box whether it
   has four options or ten, so replacing one with the next moves nothing
   around it.

   The transition: only the two parts that actually change are re-rendered,
   and they cross-fade in place. Sliding them in from the side — which is
   what this used to do — moves every word on the screen on every tap, and
   that movement is what reads as the page jumping even when the scroll
   position has not shifted by a pixel. The footer is not keyed at all: the
   Continue button is the thing under the customer's thumb, and it should
   never blink or move.

   And the shell is deliberately tighter on a large screen than the old
   marketing-page spacing was — a question the customer has to scroll to
   answer is a question they abandon.
   ========================================================================== */

/** How long a single-select answer holds before the next question arrives.
    Just enough for the tick to paint — any longer and it reads as the page
    thinking rather than as the answer registering. */
export const ACK_MS = 140;

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
  /** Opts a long screen out of the reserved question height. */
  loose?: boolean;
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
  loose = false,
}: StepShellProps) {
  const { step, next, back, canContinue, embedded } = useBuilder();
  /* One <h1> per document: on the home page the opening owns it. */
  const Heading = embedded ? 'h2' : 'h1';
  const definition = getStep(step);
  const isFirst = stepIds.indexOf(step) === 0;

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 sm:gap-6',
        wide ? 'max-w-5xl' : 'max-w-3xl',
        'mx-auto'
      )}
    >
      {/* Keyed on the step so the new title fades in over the old one's
          place rather than swapping between frames. */}
      <header
        key={`head-${step}`}
        className="step-fade flex flex-col gap-1 text-center"
      >
        <Heading className="font-display text-[1.5rem] font-semibold leading-tight text-ink sm:text-[1.875rem]">
          {definition.title}
        </Heading>
        {definition.subtitle && (
          <p className="text-[0.9375rem] text-ink-muted sm:text-base">
            {definition.subtitle}
          </p>
        )}
      </header>

      <div
        key={`body-${step}`}
        className={cn(
          'step-fade',
          !loose && !hideNav && 'flex flex-col justify-center',
          !loose && !hideNav && 'min-h-[19rem] sm:min-h-[19.5rem]'
        )}
      >
        {children}
      </div>

      {!hideNav && (
        <footer className="flex flex-col gap-2.5 sm:gap-3">
          <div className="flex flex-row-reverse items-center justify-between gap-3">
            <Button
              onClick={onNext ?? next}
              disabled={!canContinue}
              className="flex-1 sm:min-w-44 sm:flex-none"
            >
              {nextLabel}
              <Icon name="arrow-left" size={18} />
            </Button>

            <Button
              variant="ghost"
              onClick={back}
              disabled={isFirst}
              size="sm"
              className="shrink-0 sm:min-w-32"
            >
              <Icon name="arrow-right" size={18} />
              חזרה
            </Button>
          </div>

          {/* Gentle, never aggressive — a hint, not an error.

              It keeps its line whether or not it is showing: removing it the
              moment a question is answered pulls Continue 35px up the screen
              while the customer is still looking at it, which reads as the
              page twitching under their thumb. */}
          {blockedHint && (
            <p
              className={cn(
                'min-h-5 text-center text-[0.875rem] text-ink-muted sm:text-end',
                'transition-opacity duration-200',
                canContinue && 'pointer-events-none opacity-0'
              )}
              aria-live="polite"
              aria-hidden={canContinue || undefined}
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
