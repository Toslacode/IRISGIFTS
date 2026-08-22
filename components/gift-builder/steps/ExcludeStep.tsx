'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { TextField } from '@/components/ui/Field';
import { exclusions } from '@/data/taxonomy';

export function ExcludeStep() {
  const { state, dispatch } = useBuilder();
  const hasOther = state.exclusions.includes('other');

  return (
    <StepShell
      blockedHint='אם אין העדפה, בחרו "אין העדפה" כדי להמשיך'
    >
      <div className="flex flex-col gap-3.5 sm:gap-5">
        <div
          role="group"
          aria-label="יש משהו שלא תרצו במארז"
          className="stagger grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3"
        >
          {exclusions.map((option) => (
            <ChoiceCard
              key={option.id}
              label={option.label}
              role="checkbox"
              className="min-h-[4.5rem] sm:min-h-24"
              selected={state.exclusions.includes(option.id)}
              onSelect={() => {
                dispatch({ type: 'toggleExclusion', value: option.id });
                /* "אחר" opens a text field — never move on while they type. */
              }}
            />
          ))}
        </div>

        {hasOther && (
          <div className="anim-rise rounded-card border border-gold-soft bg-gold-wash/50 p-5">
            <TextField
              label="מה עוד לא להכניס?"
              placeholder="למשל: בלי בשמים, בלי מוצרים עם גלוטן"
              value={state.exclusionOther}
              autoFocus
              onChange={(e) =>
                dispatch({ type: 'setExclusionOther', value: e.target.value })
              }
            />
          </div>
        )}
      </div>
    </StepShell>
  );
}
