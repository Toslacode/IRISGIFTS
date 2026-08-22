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
      {/* Two columns all the way down on a wide screen: stacking the last two
          fields under a two-up row costs a third of the viewport for nothing,
          and the whole point of this step is that it never feels like a form
          the customer has to work through. */}
      <div className="flex flex-col gap-3 rounded-panel border border-line bg-surface p-3.5 shadow-soft sm:gap-4 sm:p-5 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:contents">
          <TextField
            label="שם לרקמה"
            optional
            hintDesktopOnly
            hint="נרקום אותו על החלוק או המגבת, אם יש כזה במארז"
            placeholder="למשל: שירה"
            value={p.embroideryName}
            maxLength={24}
            onChange={(e) => set('embroideryName', e.target.value)}
          />

          <TextField
            label="צבע מועדף"
            optional
            hintDesktopOnly
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
          hintDesktopOnly
          hint="משפט קצר שנחרוט או נדפיס על אחד הפריטים"
          placeholder="למשל: לשירה שלנו, באהבה"
          value={p.dedication}
          maxLength={80}
          onChange={(e) => set('dedication', e.target.value)}
        />

        <TextAreaField
          label="הערה מיוחדת"
          optional
          hintDesktopOnly
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
