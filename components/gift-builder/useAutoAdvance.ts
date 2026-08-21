'use client';

import { useCallback, useEffect, useState } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';

/* ==========================================================================
   Tapping an option is the answer.

   Questions with a single answer advance the moment you tap — nothing more to
   decide. Questions that allow a second choice ("one or two styles") cannot
   advance instantly without stealing the second pick, so they wait a beat:
   the countdown restarts on every tap, and a line filling across Continue
   shows it running so the move never feels like the page decided on its own.

   Reduced motion skips the wait entirely and leaves the customer on Continue.
   ========================================================================== */

const GRACE_MS = 1600;

export function useAutoAdvance() {
  const { next, canContinue } = useBuilder();
  /* A tap counter rather than a boolean: re-tapping the same option still
     changes the value, which is what restarts the countdown. Zero means
     nothing is scheduled. */
  const [tick, setTick] = useState(0);
  const [pending, setPending] = useState(false);

  /** Call after every option tap. Restarts the countdown from zero. */
  const schedule = useCallback(() => setTick((n) => n + 1), []);

  /** Call instead when the tap opens something the customer must finish. */
  const cancel = useCallback(() => setTick(0), []);

  /* The countdown lives in an effect, not in the tap handler, because a
     handler only ever sees the state from before its own dispatch — on the
     first tap the step is not answerable yet, so a handler-side check would
     always decline to schedule. By the time this effect runs the reducer has
     already applied the answer. */
  useEffect(() => {
    if (tick === 0) return;
    if (!canContinue) {
      /* Deselected the last option — nowhere to advance to. */
      setPending(false);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setPending(true);
    const id = window.setTimeout(() => {
      setPending(false);
      next();
    }, GRACE_MS);

    return () => {
      window.clearTimeout(id);
      setPending(false);
    };
  }, [tick, canContinue, next]);

  return { schedule, cancel, pending, graceMs: GRACE_MS };
}
