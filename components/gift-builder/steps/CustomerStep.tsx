'use client';

import { useState } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { TextField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { isEmail, isPhone } from '@/lib/steps';

export function CustomerStep() {
  const { state, dispatch } = useBuilder();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const c = state.customer;

  const set = (field: keyof typeof c, value: string) =>
    dispatch({ type: 'setCustomer', field, value });

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const phoneError =
    touched.phone && c.phone && !isPhone(c.phone)
      ? 'מספר הטלפון לא נראה תקין'
      : undefined;

  const whatsappError =
    touched.whatsapp && c.whatsapp && !isPhone(c.whatsapp)
      ? 'מספר הוואטסאפ לא נראה תקין'
      : undefined;

  const emailError =
    touched.email && !isEmail(c.email) ? 'כתובת האימייל לא נראית תקינה' : undefined;

  return (
    <StepShell
      nextLabel="לסיכום ההזמנה"
      blockedHint="נשאיר שם וטלפון כדי שאיריס תוכל לחזור אליכם"
    >
      <div className="flex flex-col gap-6 rounded-panel border border-line bg-surface p-6 shadow-soft sm:p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="שם המזמין"
            placeholder="שם מלא"
            value={c.name}
            autoComplete="name"
            onChange={(e) => set('name', e.target.value)}
          />

          <TextField
            label="טלפון"
            type="tel"
            inputMode="tel"
            dir="ltr"
            className="text-start"
            placeholder="050-000-0000"
            value={c.phone}
            autoComplete="tel"
            error={phoneError}
            onBlur={() => markTouched('phone')}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="וואטסאפ"
            type="tel"
            inputMode="tel"
            dir="ltr"
            className="text-start"
            optional
            hint="רק אם זה מספר אחר מהטלפון"
            placeholder="050-000-0000"
            value={c.whatsapp}
            error={whatsappError}
            onBlur={() => markTouched('whatsapp')}
            onChange={(e) => set('whatsapp', e.target.value)}
          />

          <TextField
            label="אימייל"
            type="email"
            dir="ltr"
            className="text-start"
            optional
            hint="לשליחת אישור הזמנה"
            placeholder="name@example.com"
            value={c.email}
            autoComplete="email"
            error={emailError}
            onBlur={() => markTouched('email')}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>

        <p className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-ink-muted">
          <Icon name="whatsapp" size={17} className="mt-0.5 shrink-0" />
          הפרטים משמשים רק ליצירת קשר לגבי ההזמנה הזו.
        </p>
      </div>
    </StepShell>
  );
}
