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

   Two things keep this from feeling like a web page and start it feeling like
   an app. The first is the reserved height below: every question occupies the
   same box whether it has four options or ten, so replacing one with the next
   moves nothing around it. The second is that the shell is deliberately
   tighter on a large screen than the old marketing-page spacing was — a
   question the customer has to scroll to answer is a question they abandon.
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
  const { step, next, back, canContinue, direction, embedded } = useBuilder();
  /* One <h1> per document: on the home page the opening owns it. */
  const Heading = embedded ? 'h2' : 'h1';
  const definition = getStep(step);
  const isFirst = stepIds.indexOf(step) === 0;
  /* One class drives all three blocks, so the screen arrives as a unit. */
  const enter = direction === 1 ? 'step-in' : 'step-in step-in-back';

  return (
    <div
      /* Keyed on the step so React remounts and replays the entrance */
      key={step}
      className={cn(
        'flex w-full flex-col gap-4 sm:gap-6',
        wide ? 'max-w-5xl' : 'max-w-3xl',
        'mx-auto'
      )}
    >
      <header
        className={cn(enter, 'flex flex-col gap-1 text-center')}
        style={{ '--d': 0 } as React.CSSProperties}
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

      {/* The reserved box. Questions differ by a couple of rows, not by a
          screen, so holding one height stops the footer sliding under the
          customer's thumb between taps. `loose` opts the long screens out. */}
      <div
        className={cn(
          enter,
          !loose && !hideNav && 'flex flex-col justify-center',
          !loose && !hideNav && 'min-h-[19rem] sm:min-h-[19.5rem]'
        )}
        style={{ '--d': 1 } as React.CSSProperties}
      >
        {children}
      </div>

      {!hideNav && (
        <footer
          className={cn(enter, 'flex flex-col gap-2.5 sm:gap-3')}
          style={{ '--d': 2 } as React.CSSProperties}
        >
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
