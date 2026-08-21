'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { TextAreaField, TextField } from '@/components/ui/Field';

/* Every field here is optional, so the step announces that plainly and offers
   an explicit skip — nobody should feel they're leaving something undone. */
export function PersonalizationStep() {
  const { state, dispatch, next } = useBuilder();
  const p = state.personalization;

  const set = (
    field: keyof typeof p,
    value: string
  ) => dispatch({ type: 'setPersonalization', field, value });

  return (
    <StepShell skipLabel="לדלג על השלב הזה" onSkip={next}>
      <div className="flex flex-col gap-6 rounded-panel border border-line bg-surface p-6 shadow-soft sm:p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="שם לרקמה"
            optional
            hint="נרקום אותו על החלוק או המגבת, אם יש כזה במארז"
            placeholder="למשל: שירה"
            value={p.embroideryName}
            maxLength={24}
            onChange={(e) => set('embroideryName', e.target.value)}
          />

          <TextField
            label="צבע מועדף"
            optional
            hint="לאריזה, לסרט או לרקמה"
            placeholder="למשל: פודרה, לבן, זהב"
            value={p.preferredColor}
            maxLength={40}
            onChange={(e) => set('preferredColor', e.target.value)}
          />
        </div>

        <TextField
          label="הקדשה"
          optional
          hint="משפט קצר שנחרוט או נדפיס על אחד הפריטים"
          placeholder="למשל: לשירה שלנו, באהבה"
          value={p.dedication}
          maxLength={80}
          onChange={(e) => set('dedication', e.target.value)}
        />

        <TextAreaField
          label="הערה מיוחדת"
          optional
          hint="כל דבר שכדאי שאיריס תדע לפני שהיא מרכיבה את המארז"
          placeholder="למשל: המקבלת אלרגית לאגוזים, או שזו מתנה לחמות"
          value={p.note}
          maxLength={300}
          onChange={(e) => set('note', e.target.value)}
        />
      </div>
    </StepShell>
  );
}
