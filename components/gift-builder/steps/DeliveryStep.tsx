'use client';

import { useState } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { Icon } from '@/components/ui/Icon';
import { SelectField, TextField } from '@/components/ui/Field';
import { useStore } from '@/lib/store-context';
import { isPhone } from '@/lib/steps';
import { todayISO } from '@/lib/utils';

/* Nothing about an address is shown until "משלוח" is chosen — asking for a
   city from someone collecting in person is the kind of friction this whole
   product exists to remove. */
export function DeliveryStep() {
  const { state, dispatch } = useBuilder();
  const { settings } = useStore();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const d = state.delivery;
  const set = (field: keyof typeof d, value: string) =>
    dispatch({ type: 'setDelivery', field, value });

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  /* Errors only appear after the customer has left the field. */
  const phoneError =
    touched.recipientPhone && d.recipientPhone && !isPhone(d.recipientPhone)
      ? 'מספר הטלפון לא נראה תקין'
      : undefined;

  return (
    <StepShell blockedHint="בחרו איסוף עצמי, או השלימו את פרטי המשלוח">
      <div className="flex flex-col gap-6">
        <div
          role="radiogroup"
          aria-label="איך תרצו לקבל את המתנה"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
        >
          {settings.pickupAvailable && (
            <ChoiceCard
              label="איסוף עצמי"
              hint={settings.storeAddress}
              selected={d.method === 'pickup'}
              icon={<Icon name="store" size={26} />}
              tone="sage"
              onSelect={() => set('method', 'pickup')}
            />
          )}

          <ChoiceCard
            label="משלוח"
            hint={
              settings.freeDeliveryOver > 0
                ? `${settings.deliveryFee} ₪ · חינם מעל ${settings.freeDeliveryOver} ₪`
                : `${settings.deliveryFee} ₪`
            }
            selected={d.method === 'delivery'}
            icon={<Icon name="truck" size={26} />}
            tone="sky"
            onSelect={() => set('method', 'delivery')}
          />
        </div>

        {d.method === 'pickup' && (
          <div className="anim-rise flex items-start gap-4 rounded-card border border-success/25 bg-success-wash px-5 py-4">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
              <Icon name="check" size={17} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-ink">נתאם איתכם מועד לאיסוף</p>
              <p className="text-[0.9375rem] text-ink-muted">
                {settings.storeAddress} · {settings.storePhone}
              </p>
            </div>
          </div>
        )}

        {d.method === 'delivery' && (
          <div className="anim-rise flex flex-col gap-6 rounded-panel border border-line bg-surface p-6 shadow-soft sm:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextField
                label="שם המקבל"
                placeholder="למי למסור את המארז"
                value={d.recipientName}
                autoComplete="name"
                onChange={(e) => set('recipientName', e.target.value)}
              />

              <TextField
                label="טלפון המקבל"
                type="tel"
                inputMode="tel"
                dir="ltr"
                className="text-start"
                placeholder="050-000-0000"
                value={d.recipientPhone}
                autoComplete="tel"
                error={phoneError}
                onBlur={() => markTouched('recipientPhone')}
                onChange={(e) => set('recipientPhone', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SelectField
                label="עיר"
                hint="אלה אזורי החלוקה שלנו"
                value={d.city}
                onChange={(e) => set('city', e.target.value)}
              >
                <option value="">בחרו עיר</option>
                {settings.deliveryAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
                <option value="אחר">עיר אחרת — נתאם בטלפון</option>
              </SelectField>

              <TextField
                label="כתובת"
                placeholder="רחוב, מספר, דירה"
                value={d.address}
                autoComplete="street-address"
                onChange={(e) => set('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextField
                label="תאריך משלוח"
                type="date"
                optional
                hint="נאשר את המועד איתכם"
                min={todayISO()}
                value={d.date}
                onChange={(e) => set('date', e.target.value)}
              />

              <TextField
                label="הערות לשליח"
                optional
                placeholder="למשל: לצלצל לפני, להשאיר אצל השכן"
                value={d.courierNotes}
                onChange={(e) => set('courierNotes', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </StepShell>
  );
}
