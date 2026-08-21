'use client';

import { useState } from 'react';

import { SavedFlash, useSavedFlash } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/Button';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { occasions, recipients, styles } from '@/data/taxonomy';
import { formatPrice } from '@/lib/order';
import { basketPrice } from '@/lib/recommendation';
import { useStore } from '@/lib/store-context';
import { cn, slugify } from '@/lib/utils';
import type {
  OccasionId,
  PredefinedBasket,
  Product,
  RecipientId,
  StyleId,
} from '@/types';

function blankBasket(): PredefinedBasket {
  return {
    id: '',
    name: '',
    description: '',
    rationale: '',
    productIds: [],
    image: '',
    recipients: [],
    occasions: [],
    styles: [],
    active: true,
  };
}

export function BasketAdmin() {
  const { baskets, products, saveBaskets } = useStore();
  const [editing, setEditing] = useState<PredefinedBasket | null>(null);
  const { saved, flash } = useSavedFlash();

  const upsert = (basket: PredefinedBasket) => {
    const id = basket.id || slugify(basket.name) || `basket-${Date.now()}`;
    const withId = { ...basket, id };
    const exists = baskets.some((b) => b.id === id);

    saveBaskets(
      exists
        ? baskets.map((b) => (b.id === id ? withId : b))
        : [...baskets, withId]
    );
    setEditing(null);
    flash();
  };

  const remove = (basket: PredefinedBasket) => {
    if (!window.confirm(`למחוק את "${basket.name}"?`)) return;
    saveBaskets(baskets.filter((b) => b.id !== basket.id));
    flash();
  };

  if (editing) {
    return (
      <BasketForm
        basket={editing}
        products={products}
        onCancel={() => setEditing(null)}
        onSave={upsert}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-heading">מארזים מוכנים</h1>
          <span className="text-[0.875rem] text-ink-muted">
            {baskets.length} מארזים
          </span>
          <SavedFlash show={saved} />
        </div>

        <Button size="sm" onClick={() => setEditing(blankBasket())}>
          <Icon name="plus" size={17} />
          מארז חדש
        </Button>
      </div>

      <p className="rounded-card border border-line bg-canvas-deep/50 px-4 py-3 text-[0.875rem] leading-relaxed text-ink-muted">
        כשלקוח עונה על השאלות, המערכת מחפשת קודם מארז מוכן שמתאים לתשובות שלו.
        ככל שהתגיות כאן מדויקות יותר, כך ההמלצה קרובה יותר למה שהייתם מציעים
        בעצמכם.
      </p>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {baskets.map((basket) => {
          const price = basketPrice(basket, products);
          return (
            <li
              key={basket.id}
              className={cn(
                'flex gap-4 rounded-card border bg-surface p-3',
                basket.active ? 'border-line' : 'border-line opacity-55'
              )}
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-card">
                <ProductImage
                  src={basket.image}
                  alt=""
                  category="personalized"
                  className="size-full"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-display font-semibold text-ink">
                  {basket.name}
                </span>
                <span className="text-[0.8125rem] text-ink-muted">
                  {basket.productIds.length} פריטים · {formatPrice(price)}
                  {basket.basePrice ? ' (מחיר קבוע)' : ''}
                </span>

                <div className="mt-auto flex items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditing(basket)}
                    className="min-h-11 cursor-pointer rounded-pill px-3 text-[0.8125rem] text-gold-deep transition-colors duration-200 hover:bg-gold-wash"
                  >
                    עריכה
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveBaskets(
                        baskets.map((b) =>
                          b.id === basket.id ? { ...b, active: !b.active } : b
                        )
                      )
                    }
                    className="min-h-11 cursor-pointer rounded-pill px-3 text-[0.8125rem] text-ink-muted transition-colors duration-200 hover:bg-canvas-deep hover:text-ink"
                  >
                    {basket.active ? 'הסתרה' : 'הצגה'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(basket)}
                    className="min-h-11 cursor-pointer rounded-pill px-3 text-[0.8125rem] text-ink-muted transition-colors duration-200 hover:bg-danger-wash hover:text-danger"
                  >
                    מחיקה
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BasketForm({
  basket,
  products,
  onSave,
  onCancel,
}: {
  basket: PredefinedBasket;
  products: Product[];
  onSave: (basket: PredefinedBasket) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<PredefinedBasket>(basket);
  const isNew = !basket.id;

  const set = <K extends keyof PredefinedBasket>(
    key: K,
    value: PredefinedBasket[K]
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleProduct = (id: string) =>
    set(
      'productIds',
      draft.productIds.includes(id)
        ? draft.productIds.filter((p) => p !== id)
        : [...draft.productIds, id]
    );

  const toggleTag = <T extends string>(
    key: 'recipients' | 'occasions' | 'styles',
    value: T
  ) => {
    const list = draft[key] as unknown as T[];
    set(
      key,
      (list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]) as never
    );
  };

  const sum = draft.productIds.reduce(
    (total, id) => total + (products.find((p) => p.id === id)?.price ?? 0),
    0
  );

  const valid = draft.name.trim().length > 1 && draft.productIds.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave(draft);
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-heading">
          {isNew ? 'מארז חדש' : `עריכת ${basket.name}`}
        </h1>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          ביטול
        </Button>
      </div>

      <div className="flex flex-col gap-6 rounded-panel border border-line bg-surface p-6">
        <TextField
          label="שם המארז"
          value={draft.name}
          required
          onChange={(e) => set('name', e.target.value)}
        />

        <TextAreaField
          label="תיאור"
          hint="מה הלקוח רואה בקטלוג"
          value={draft.description}
          maxLength={160}
          className="min-h-24"
          onChange={(e) => set('description', e.target.value)}
        />

        <TextAreaField
          label="למה המארז הזה מתאים"
          hint="המשפט שמופיע ללקוח אחרי שהמערכת ממליצה על המארז"
          value={draft.rationale}
          maxLength={240}
          className="min-h-24"
          onChange={(e) => set('rationale', e.target.value)}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="מחיר קבוע (₪)"
            type="number"
            min={0}
            optional
            hint={`בלי מחיר קבוע יחושב סכום הפריטים: ${formatPrice(sum)}`}
            value={draft.basePrice ?? ''}
            onChange={(e) =>
              set(
                'basePrice',
                e.target.value === '' ? undefined : Number(e.target.value)
              )
            }
          />

          <TextField
            label="נתיב תמונה"
            optional
            dir="ltr"
            className="text-start"
            placeholder="/images/basket-name.jpg"
            value={draft.image}
            onChange={(e) => set('image', e.target.value)}
          />
        </div>

        {/* Which products are in it */}
        <fieldset>
          <legend className="mb-1 text-[0.9375rem] font-semibold text-ink">
            פריטים במארז
          </legend>
          <p className="mb-3 text-[0.8125rem] text-ink-muted">
            נבחרו {draft.productIds.length} פריטים · סכום {formatPrice(sum)}
          </p>

          <div className="grid max-h-80 grid-cols-1 gap-1.5 overflow-y-auto rounded-card border border-line bg-canvas p-2 sm:grid-cols-2">
            {products.map((product) => {
              const on = draft.productIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  aria-pressed={on}
                  className={cn(
                    'flex min-h-12 cursor-pointer items-center gap-2.5 rounded-card border px-3 py-2 text-start transition-colors duration-200',
                    on
                      ? 'border-gold bg-gold-wash'
                      : 'border-transparent bg-surface hover:border-gold-soft'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border',
                      on
                        ? 'border-gold bg-gold text-white'
                        : 'border-line-strong'
                    )}
                  >
                    {on && <Icon name="check" size={12} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.875rem] text-ink">
                    {product.name}
                  </span>
                  <span className="shrink-0 text-[0.8125rem] tabular-nums text-ink-muted">
                    {product.price}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <TagGroup
          legend="מתאים למי"
          options={recipients}
          selected={draft.recipients}
          onToggle={(v) => toggleTag<RecipientId>('recipients', v)}
        />
        <TagGroup
          legend="מתאים לאירועים"
          options={occasions}
          selected={draft.occasions}
          onToggle={(v) => toggleTag<OccasionId>('occasions', v)}
        />
        <TagGroup
          legend="סגנונות"
          options={styles}
          selected={draft.styles}
          onToggle={(v) => toggleTag<StyleId>('styles', v)}
        />

        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-2 text-[0.9375rem] font-semibold text-ink">
            מצב
          </legend>
          <button
            type="button"
            onClick={() => set('active', !draft.active)}
            aria-pressed={draft.active}
            className={cn(
              'min-h-11 cursor-pointer rounded-pill border px-3.5 text-[0.875rem] transition-colors duration-200',
              draft.active
                ? 'border-success/30 bg-success-wash text-success'
                : 'border-line bg-canvas-deep text-ink-muted'
            )}
          >
            {draft.active ? 'פעיל' : 'לא פעיל'}
          </button>
          <button
            type="button"
            onClick={() => set('featured', !draft.featured)}
            aria-pressed={Boolean(draft.featured)}
            className={cn(
              'min-h-11 cursor-pointer rounded-pill border px-3.5 text-[0.875rem] transition-colors duration-200',
              draft.featured
                ? 'border-gold bg-gold-wash text-ink'
                : 'border-line bg-canvas text-ink-muted'
            )}
          >
            {draft.featured ? 'מסומן כמבוקש' : 'רגיל'}
          </button>
        </fieldset>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" disabled={!valid}>
          שמירה
        </Button>
      </div>

      {!valid && (
        <p className="text-end text-[0.875rem] text-ink-muted">
          צריך שם ולפחות פריט אחד כדי לשמור
        </p>
      )}
    </form>
  );
}

function TagGroup<T extends string>({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: { id: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[0.9375rem] font-semibold text-ink">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              aria-pressed={on}
              className={cn(
                'min-h-11 cursor-pointer rounded-pill border px-3.5 text-[0.875rem] transition-colors duration-200',
                on
                  ? 'border-gold bg-gold-wash text-ink'
                  : 'border-line bg-canvas text-ink-muted hover:border-gold-soft hover:text-ink'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
