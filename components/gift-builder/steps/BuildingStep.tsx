'use client';

import { useEffect, useRef, useState } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { Icon } from '@/components/ui/Icon';
import { useVisibleCatalog } from '@/lib/store-context';
import { recommend } from '@/lib/recommendation';

/* ==========================================================================
   The transition between answering and seeing.

   The engine is synchronous and finishes in under a millisecond — this pause
   exists because a basket that appears instantly reads as a lookup, and one
   that takes a beat reads as work done on the customer's behalf. It is short,
   it is honest about what it's doing, and it never blocks.
   ========================================================================== */

const BEATS = [
  'קוראים את התשובות שלכם',
  'בוחרים פריטים שמתאימים לאירוע',
  'מאזנים את המארז מול התקציב',
];

export function BuildingStep() {
  const { state, dispatch, goTo, embedded } = useBuilder();
  const Heading = embedded ? 'h2' : 'h1';
  const { products, baskets } = useVisibleCatalog();
  const [beat, setBeat] = useState(0);

  /* Everything the effect needs, read through a ref so the effect can run
     exactly once. Listing `state` as a dependency would re-run it the moment
     `setBasket` lands, and the cleanup would cancel the advance timer — the
     flow would sit on this screen forever. */
  const latest = useRef({ state, products, baskets, dispatch, goTo });
  latest.current = { state, products, baskets, dispatch, goTo };

  useEffect(() => {
    const { state: s, products: p, baskets: b, dispatch: d, goTo: go } =
      latest.current;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Compute immediately — the wait below is presentational, not a wait on
       the engine, which finishes in well under a millisecond. */
    const result = recommend(s, { catalog: p, baskets: b });
    d({ type: 'setBasket', value: result.draft });

    if (reduce) {
      go('recommendation');
      return;
    }

    const beatTimers = BEATS.map((_, i) =>
      window.setTimeout(() => setBeat(i), i * 620)
    );
    const finish = window.setTimeout(() => go('recommendation'), 2000);

    return () => {
      beatTimers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-8 text-center">
      {/* A gold ring closing around the gift mark — calm, not a spinner race */}
      <div className="relative flex size-28 items-center justify-center">
        <svg
          className="absolute inset-0 size-full motion-safe:animate-[iris-spin_2.8s_linear_infinite]"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--color-gold-soft)"
            strokeWidth="1.5"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="72 217"
          />
        </svg>
        <Icon name="gift" size={38} className="text-gold-deep" />
      </div>

      <div className="flex flex-col gap-3">
        <Heading className="text-title">רגע, אנחנו מרכיבים לכם משהו מיוחד…</Heading>
        {/* Announced politely so the change is heard, not interrupted */}
        <p
          key={beat}
          className="anim-fade text-lg text-ink-muted"
          aria-live="polite"
        >
          {BEATS[beat]}
        </p>
      </div>
    </div>
  );
}
