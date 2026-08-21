'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { railPosition } from '@/lib/steps';

/* ==========================================================================
   Where am I, and how much is left.

   A counter and a champagne hairline — nothing else. The customer only needs
   the answer at a glance, and the step footer already carries "חזרה".
   ========================================================================== */

export function ProgressRail() {
  const { step } = useBuilder();
  const { current, total, past } = railPosition(step);
  const pct = past ? 100 : (current / total) * 100;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[0.875rem] font-medium text-ink-soft">
          {past ? (
            'השאלות הושלמו'
          ) : (
            <>
              שלב <span className="text-ink">{current}</span> מתוך {total}
            </>
          )}
        </p>
        {!past && (
          <p className="text-[0.8125rem] text-ink-muted">
            {total - current === 0
              ? 'שאלה אחרונה'
              : `נשארו עוד ${total - current}`}
          </p>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={past ? total : current}
        aria-label="התקדמות בבניית המארז"
        className="h-px w-full bg-line"
      >
        <div
          className="h-full bg-gold transition-[width] duration-500 ease-out-soft"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
