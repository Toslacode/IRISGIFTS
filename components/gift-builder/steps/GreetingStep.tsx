'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { TextAreaField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';

/* A few openers people can start from. Not AI — just the sentences Iris ends
   up writing anyway, offered as a starting point they can edit. */
const STARTERS = [
  'מזל טוב! שיהיה לכם בית מלא באהבה, בשמחה ובבריאות.',
  'ברכות חמות ליום המיוחד. שתמשיכו לחייך ככה תמיד.',
  'בהצלחה בפרק החדש. מגיע לכם רק טוב.',
];

export function GreetingStep() {
  const { state, dispatch, next } = useBuilder();

  return (
    <StepShell skipLabel="בלי ברכה, תודה" onSkip={next}>
      <div className="flex flex-col gap-6">
        <div className="rounded-panel border border-line bg-surface p-6 shadow-soft sm:p-8">
          <TextAreaField
            label="הברכה שתודפס על הכרטיס"
            optional
            hint="אפשר לכתוב בעצמכם, או להתחיל מאחת ההצעות למטה"
            placeholder="מזל טוב…"
            value={state.greeting}
            maxLength={400}
            className="min-h-44 font-display text-lg leading-loose"
            onChange={(e) =>
              dispatch({ type: 'setGreeting', value: e.target.value })
            }
          />

          <div className="mt-5 flex flex-col gap-3">
            <p className="text-[0.875rem] font-medium text-ink-soft">
              רוצים רעיון להתחלה?
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() =>
                    dispatch({ type: 'setGreeting', value: starter })
                  }
                  className="min-h-11 cursor-pointer rounded-pill border border-line bg-canvas px-4 text-start text-[0.875rem] text-ink-soft transition-colors duration-200 hover:border-gold hover:bg-gold-wash hover:text-ink"
                >
                  {starter.slice(0, 34)}…
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Honest about what isn't built yet, rather than a dead button that
            looks broken when tapped. */}
        <div className="flex items-center gap-3 rounded-card border border-dashed border-line-strong bg-canvas-deep/60 px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink-faint">
            <Icon name="sparkle" size={19} />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-ink-soft">עזרו לי לכתוב ברכה</p>
            <p className="text-[0.8125rem] text-ink-muted">
              בקרוב — כתיבת ברכה אוטומטית לפי האירוע והנמען
            </p>
          </div>
        </div>
      </div>
    </StepShell>
  );
}
