'use client';

import { useState } from 'react';

import { SavedFlash, useSavedFlash } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/Button';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { normalizeWhatsAppNumber } from '@/lib/order';
import { useStore } from '@/lib/store-context';
import { cn } from '@/lib/utils';
import type { StoreSettings } from '@/types';

export function SettingsAdmin() {
  const { settings, saveSettings, resetCatalog } = useStore();
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const { saved, flash } = useSavedFlash();

  const set = <K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K]
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const normalized = normalizeWhatsAppNumber(draft.whatsappNumber);
  const numberLooksRight = /^972\d{8,9}$/.test(normalized);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveSettings({ ...draft, whatsappNumber: normalized });
        flash();
      }}
      className="flex max-w-3xl flex-col gap-6"
    >
      <div className="flex items-baseline gap-3">
        <h1 className="text-heading">הגדרות</h1>
        <SavedFlash show={saved} />
      </div>

      <section className="flex flex-col gap-6 rounded-panel border border-line bg-surface p-6">
        <h2 className="text-[0.9375rem] font-semibold text-ink">
          יצירת קשר
        </h2>

        <TextField
          label="מספר וואטסאפ לקבלת הזמנות"
          hint="לשם נשלחות כל ההזמנות מהאתר. אפשר לכתוב 0501234567 או 972501234567"
          dir="ltr"
          className="text-start"
          value={draft.whatsappNumber}
          error={
            draft.whatsappNumber && !numberLooksRight
              ? 'המספר לא נראה כמו מספר ישראלי תקין'
              : undefined
          }
          onChange={(e) => set('whatsappNumber', e.target.value)}
        />

        {numberLooksRight && (
          <p className="-mt-3 flex items-center gap-2 text-[0.8125rem] text-ink-muted">
            <Icon name="whatsapp" size={15} className="shrink-0" />
            ההזמנות יישלחו אל
            <span dir="ltr" className="font-medium text-ink">
              wa.me/{normalized}
            </span>
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="טלפון החנות"
            dir="ltr"
            className="text-start"
            value={draft.storePhone}
            onChange={(e) => set('storePhone', e.target.value)}
          />
          <TextField
            label="כתובת החנות"
            value={draft.storeAddress}
            onChange={(e) => set('storeAddress', e.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-panel border border-line bg-surface p-6">
        <h2 className="text-[0.9375rem] font-semibold text-ink">
          משלוחים ואיסוף
        </h2>

        <TextAreaField
          label="אזורי חלוקה"
          hint="עיר אחת בכל שורה. אלה הערים שהלקוח יכול לבחור מהן"
          value={draft.deliveryAreas.join('\n')}
          className="min-h-40"
          onChange={(e) =>
            set(
              'deliveryAreas',
              e.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
            )
          }
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="עלות משלוח (₪)"
            type="number"
            min={0}
            value={draft.deliveryFee}
            onChange={(e) => set('deliveryFee', Number(e.target.value))}
          />
          <TextField
            label="משלוח חינם מעל (₪)"
            type="number"
            min={0}
            hint="אפס מבטל את ההטבה"
            value={draft.freeDeliveryOver}
            onChange={(e) => set('freeDeliveryOver', Number(e.target.value))}
          />
        </div>

        <button
          type="button"
          onClick={() => set('pickupAvailable', !draft.pickupAvailable)}
          aria-pressed={draft.pickupAvailable}
          className={cn(
            'w-fit min-h-11 cursor-pointer rounded-pill border px-4 text-[0.875rem] transition-colors duration-200',
            draft.pickupAvailable
              ? 'border-success/30 bg-success-wash text-success'
              : 'border-line bg-canvas-deep text-ink-muted'
          )}
        >
          {draft.pickupAvailable
            ? 'איסוף עצמי מוצע ללקוחות'
            : 'איסוף עצמי לא מוצע'}
        </button>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="submit">שמירת ההגדרות</Button>
      </div>

      {/* Honest about where this data lives */}
      <section className="flex flex-col gap-3 rounded-panel border border-dashed border-line-strong bg-canvas-deep/50 p-6">
        <h2 className="text-[0.9375rem] font-semibold text-ink">
          על השמירה
        </h2>
        <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
          בגרסה הזו השינויים נשמרים בדפדפן הזה בלבד — הם לא מסונכרנים למכשירים
          אחרים ולא לשרת. כשמחברים בסיס נתונים, אותו מסך ימשיך לעבוד בדיוק
          באותה צורה.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="w-fit"
          onClick={() => {
            if (
              window.confirm(
                'לאפס את כל המוצרים, המארזים וההגדרות לערכי ברירת המחדל?'
              )
            ) {
              resetCatalog();
              setDraft(settings);
            }
          }}
        >
          איפוס לנתוני ההתחלה
        </Button>
      </section>
    </form>
  );
}
