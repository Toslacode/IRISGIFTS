'use client';

import { useState } from 'react';

import { SavedFlash, useSavedFlash } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/Button';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import {
  includeCategories,
  occasions,
  recipients,
  styles,
} from '@/data/taxonomy';
import { formatPrice } from '@/lib/order';
import { useStore } from '@/lib/store-context';
import { cn, slugify } from '@/lib/utils';
import type {
  CategoryId,
  OccasionId,
  Product,
  RecipientId,
  StyleId,
} from '@/types';

function blankProduct(): Product {
  return {
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'homeware',
    recipients: [],
    occasions: [],
    styles: [],
    image: '',
    active: true,
    inStock: true,
    personalizationAvailable: false,
  };
}

export function ProductAdmin() {
  const { products, saveProducts } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [query, setQuery] = useState('');
  const { saved, flash } = useSavedFlash();

  const shown = products.filter(
    (p) =>
      p.name.includes(query.trim()) || p.description.includes(query.trim())
  );

  const upsert = (product: Product) => {
    const id = product.id || slugify(product.name) || `product-${Date.now()}`;
    const withId = { ...product, id };
    const exists = products.some((p) => p.id === id);

    saveProducts(
      exists
        ? products.map((p) => (p.id === id ? withId : p))
        : [...products, withId]
    );
    setEditing(null);
    flash();
  };

  const patch = (id: string, changes: Partial<Product>) => {
    saveProducts(
      products.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
    flash();
  };

  const remove = (product: Product) => {
    /* No modal: the row is right there and the action is small. Confirm is
       the honest minimum for something irreversible. */
    if (!window.confirm(`למחוק את "${product.name}"?`)) return;
    saveProducts(products.filter((p) => p.id !== product.id));
    flash();
  };

  if (editing) {
    return (
      <ProductForm
        product={editing}
        onCancel={() => setEditing(null)}
        onSave={upsert}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-heading">מוצרים</h1>
          <span className="text-[0.875rem] text-ink-muted">
            {products.length} פריטים
          </span>
          <SavedFlash show={saved} />
        </div>

        <Button size="sm" onClick={() => setEditing(blankProduct())}>
          <Icon name="plus" size={17} />
          מוצר חדש
        </Button>
      </div>

      <label className="flex items-center gap-2 rounded-card border border-line bg-surface px-4">
        <Icon name="search" size={18} className="shrink-0 text-ink-faint" />
        <span className="sr-only">חיפוש מוצר</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי שם או תיאור"
          className="w-full bg-transparent py-3 outline-none placeholder:text-ink-faint"
        />
      </label>

      {shown.length === 0 ? (
        <p className="rounded-card border border-dashed border-line-strong bg-canvas-deep/50 px-6 py-12 text-center text-ink-muted">
          לא נמצאו מוצרים שמתאימים לחיפוש.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {shown.map((product) => (
            <li
              key={product.id}
              className={cn(
                'flex flex-wrap items-center gap-4 rounded-card border bg-surface p-3 transition-opacity',
                product.active ? 'border-line' : 'border-line opacity-55'
              )}
            >
              <div className="size-14 shrink-0 overflow-hidden rounded-card">
                <ProductImage
                  src={product.image}
                  alt=""
                  category={product.category}
                  className="size-full"
                />
              </div>

              <div className="flex min-w-40 flex-1 flex-col">
                <span className="font-display font-semibold text-ink">
                  {product.name}
                </span>
                <span className="truncate text-[0.875rem] text-ink-muted">
                  {product.description}
                </span>
              </div>

              <span className="shrink-0 font-display font-medium tabular-nums text-ink">
                {formatPrice(product.price)}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <Toggle
                  on={product.inStock}
                  onLabel="במלאי"
                  offLabel="אזל"
                  onToggle={() =>
                    patch(product.id, { inStock: !product.inStock })
                  }
                />
                <Toggle
                  on={product.active}
                  onLabel="מוצג"
                  offLabel="מוסתר"
                  onToggle={() => patch(product.id, { active: !product.active })}
                />

                <button
                  type="button"
                  onClick={() => setEditing(product)}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-gold-wash hover:text-gold-deep"
                >
                  <Icon name="edit" size={17} label={`עריכת ${product.name}`} />
                </button>

                <button
                  type="button"
                  onClick={() => remove(product)}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-danger-wash hover:text-danger"
                >
                  <Icon name="trash" size={17} label={`מחיקת ${product.name}`} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Toggle({
  on,
  onLabel,
  offLabel,
  onToggle,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        'min-h-11 cursor-pointer rounded-pill border px-3 text-[0.8125rem] transition-colors duration-200',
        on
          ? 'border-success/30 bg-success-wash text-success'
          : 'border-line bg-canvas-deep text-ink-muted'
      )}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}

/* --------------------------------------------------------------------------
   The editor
   -------------------------------------------------------------------------- */

function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Product>(product);
  const isNew = !product.id;

  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleIn = <T extends string>(key: keyof Product, value: T) => {
    const list = draft[key] as unknown as T[];
    set(
      key,
      (list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]) as unknown as Product[typeof key]
    );
  };

  const valid = draft.name.trim().length > 1 && draft.price > 0;

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
          {isNew ? 'מוצר חדש' : `עריכת ${product.name}`}
        </h1>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          ביטול
        </Button>
      </div>

      <div className="flex flex-col gap-6 rounded-panel border border-line bg-surface p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="שם המוצר"
            value={draft.name}
            required
            onChange={(e) => set('name', e.target.value)}
          />
          <TextField
            label="מחיר (₪)"
            type="number"
            min={0}
            step={1}
            value={draft.price || ''}
            required
            onChange={(e) => set('price', Number(e.target.value))}
          />
        </div>

        <TextAreaField
          label="תיאור קצר"
          hint="שורה אחת שהלקוח רואה על הכרטיס"
          value={draft.description}
          maxLength={120}
          className="min-h-24"
          onChange={(e) => set('description', e.target.value)}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SelectField
            label="קטגוריה"
            value={draft.category}
            onChange={(e) => set('category', e.target.value as CategoryId)}
          >
            {includeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </SelectField>

          <TextField
            label="נתיב תמונה"
            optional
            hint="העלו קובץ ל־public/products וכתבו כאן את הנתיב"
            dir="ltr"
            className="text-start"
            placeholder="/products/my-item.jpg"
            value={draft.image}
            onChange={(e) => set('image', e.target.value)}
          />
        </div>

        <TagPicker
          legend="מתאים למי"
          options={recipients}
          selected={draft.recipients}
          onToggle={(v) => toggleIn<RecipientId>('recipients', v)}
        />

        <TagPicker
          legend="מתאים לאירועים"
          options={occasions}
          selected={draft.occasions}
          onToggle={(v) => toggleIn<OccasionId>('occasions', v)}
        />

        <TagPicker
          legend="סגנונות"
          options={styles}
          selected={draft.styles}
          onToggle={(v) => toggleIn<StyleId>('styles', v)}
        />

        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-2 text-[0.9375rem] font-semibold text-ink">
            מצב
          </legend>
          <Toggle
            on={draft.active}
            onLabel="מוצג באתר"
            offLabel="מוסתר"
            onToggle={() => set('active', !draft.active)}
          />
          <Toggle
            on={draft.inStock}
            onLabel="במלאי"
            offLabel="אזל מהמלאי"
            onToggle={() => set('inStock', !draft.inStock)}
          />
          <Toggle
            on={draft.personalizationAvailable}
            onLabel="ניתן להתאמה אישית"
            offLabel="בלי התאמה אישית"
            onToggle={() =>
              set('personalizationAvailable', !draft.personalizationAvailable)
            }
          />
          <Toggle
            on={Boolean(draft.hero)}
            onLabel="פריט מוביל"
            offLabel="פריט משלים"
            onToggle={() => set('hero', !draft.hero)}
          />
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
          צריך שם ומחיר גדול מאפס כדי לשמור
        </p>
      )}
    </form>
  );
}

function TagPicker<T extends string>({
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
