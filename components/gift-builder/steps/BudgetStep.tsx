'use client';

import { useState } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { budgetBands } from '@/data/taxonomy';
import { cn } from '@/lib/utils';

/* The whole question is "how much" — so the bands are big, obvious taps, and
   the exact figure is tucked behind one disclosure for the minority who have
   a precise number in mind. */
export function BudgetStep() {
  const { state, dispatch, next } = useBuilder();
  const [showExact, setShowExact] = useState(
    state.budget.exactAmount !== null
  );

  const exactValue = state.budget.exactAmount ?? '';

  return (
    <StepShell blockedHint="בחרו טווח תקציב או הזינו סכום מדויק">
      <div className="flex flex-col gap-4 sm:gap-5">
        <div
          role="radiogroup"
          aria-label="מה התקציב שלכם"
          className="stagger grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3"
        >
          {budgetBands.map((band) => (
            <ChoiceCard
              key={band.id}
              label={band.label}
              selected={state.budget.bandId === band.id}
              className="min-h-[4.5rem] sm:min-h-20"
              onSelect={() => {
                dispatch({ type: 'setBudgetBand', value: band.id });
                setShowExact(false);
                window.setTimeout(next, 220);
              }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {!showExact ? (
            <button
              type="button"
              onClick={() => setShowExact(true)}
              className="mx-auto min-h-11 cursor-pointer rounded-pill px-4 text-[0.9375rem] text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-ink"
            >
              יש לי תקציב מדויק
            </button>
          ) : (
            <div className="anim-rise mx-auto w-full max-w-sm rounded-card border border-gold-soft bg-gold-wash/50 p-5">
              <label
                htmlFor="exact-budget"
                className="mb-2 block text-[0.9375rem] font-semibold text-ink"
              >
                תקציב מדויק
              </label>

              <div
                className={cn(
                  'flex items-center gap-2 rounded-card border bg-surface px-4',
                  'transition-[border-color,box-shadow] duration-200',
                  'focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25',
                  state.budget.exactAmount ? 'border-gold' : 'border-line'
                )}
              >
                <span
                  aria-hidden="true"
                  className="font-display text-xl text-gold-deep"
                >
                  ₪
                </span>
                <input
                  id="exact-budget"
                  type="number"
                  inputMode="numeric"
                  min={50}
                  max={5000}
                  step={10}
                  placeholder="700"
                  value={exactValue}
                  onChange={(e) => {
                    const raw = e.target.value;
                    dispatch({
                      type: 'setExactBudget',
                      value: raw === '' ? null : Number(raw),
                    });
                  }}
                  className="w-full bg-transparent py-3 text-lg text-ink outline-none placeholder:text-ink-faint"
                />
              </div>

              <p className="mt-2 text-[0.8125rem] text-ink-muted">
                נשתדל לא לחרוג מהסכום הזה
              </p>
            </div>
          )}
        </div>
      </div>
    </StepShell>
  );
}
