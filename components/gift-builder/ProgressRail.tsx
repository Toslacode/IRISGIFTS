'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { railPosition, railSteps, stepIds, type StepId } from '@/lib/steps';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Where am I, and how much is left.

   A hairline of gold rather than a chunky bar — the brief asks for subtle,
   and the customer only needs the answer at a glance.
   ========================================================================== */

export function ProgressRail() {
  const { step, goTo, state } = useBuilder();
  const { current, total, past } = railPosition(step);
  const currentIndex = stepIds.indexOf(step);
  const remaining = Math.max(0, total - current);

  /* Past the questions, the rail is complete. */
  const pct = past ? 100 : (current / total) * 100;

  return (
    <div className="flex flex-col gap-3">
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
        <p className="text-[0.8125rem] text-ink-muted">
          {past
            ? 'אפשר לחזור ולשנות כל תשובה'
            : remaining === 0
              ? 'שאלה אחרונה'
              : `נשארו עוד ${remaining} שאלות`}
        </p>
      </div>

      {/* The bar itself — a progressbar for assistive tech */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(current, total)}
        aria-label="התקדמות בבניית המארז"
        className="h-px w-full bg-line"
      >
        <div
          className="h-full bg-gold transition-[width] duration-500 ease-out-soft"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Named steps — answered ones are clickable, so going back to change
          an answer is one tap rather than repeated Back presses. */}
      <ol className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {railSteps.map((railStep) => {
          const index = stepIds.indexOf(railStep.id);
          const isCurrent = railStep.id === step;
          const isPast = index < currentIndex;
          const answered = railStep.isComplete(state);
          const reachable = isPast || answered;

          return (
            <li key={railStep.id}>
              <button
                type="button"
                onClick={() => reachable && goTo(railStep.id as StepId)}
                disabled={!reachable && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'min-h-11 whitespace-nowrap rounded-pill px-3 text-[0.8125rem] transition-colors duration-200',
                  isCurrent && 'bg-ink font-medium text-canvas',
                  !isCurrent && reachable && 'cursor-pointer text-ink-muted hover:bg-gold-wash hover:text-ink',
                  !isCurrent && !reachable && 'cursor-not-allowed text-ink-faint'
                )}
              >
                {railStep.label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
