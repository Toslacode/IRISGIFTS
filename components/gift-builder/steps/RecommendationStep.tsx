'use client';

import { useCallback, useMemo, useState } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { BasketItemRow } from '@/components/gift-builder/BasketItemRow';
import { ProductPicker } from '@/components/gift-builder/ProductPicker';
import { StepShell } from '@/components/gift-builder/StepShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/order';
import {
  draftTotal,
  recommend,
  suggestAdditions,
  swapCandidates,
} from '@/lib/recommendation';
import { useVisibleCatalog } from '@/lib/store-context';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

/* ==========================================================================
   The basket we built, and everything the customer can do to it.

   The price is live: it recalculates on every edit rather than at checkout,
   because "what does this cost now" is the question being asked with each tap.
   ========================================================================== */

type PickerMode =
  | { kind: 'closed' }
  | { kind: 'add' }
  | { kind: 'swap'; productId: string };

export function RecommendationStep() {
  const { state, dispatch, next } = useBuilder();
  const { products, baskets } = useVisibleCatalog();
  const [picker, setPicker] = useState<PickerMode>({ kind: 'closed' });
  const [variant, setVariant] = useState(0);
  const [reshuffling, setReshuffling] = useState(false);
  /* The row on its way out. The reducer runs when its collapse finishes. */
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const basket = state.basket;

  const lines = useMemo(() => {
    if (!basket) return [];
    const byId = new Map(products.map((p) => [p.id, p]));
    return basket.items
      .map((item) => byId.get(item.productId))
      .filter((p): p is Product => Boolean(p));
  }, [basket, products]);

  /* Editing clears the store's fixed price, so this is the live figure. */
  const total = useMemo(() => {
    if (!basket) return 0;
    return basket.basePrice ?? draftTotal(basket, products);
  }, [basket, products]);

  const removeItem = useCallback(
    (productId: string) => {
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduce) {
        dispatch({ type: 'removeItem', productId });
        return;
      }

      setLeavingId(productId);
      window.setTimeout(() => {
        dispatch({ type: 'removeItem', productId });
        setLeavingId(null);
      }, 260);
    },
    [dispatch]
  );

  const suggestAnother = useCallback(() => {
    const nextVariant = variant + 1;
    setVariant(nextVariant);
    setReshuffling(true);

    const result = recommend(state, {
      variant: nextVariant,
      catalog: products,
      baskets,
    });

    /* A short beat so the swap is perceived rather than blinked past. */
    window.setTimeout(() => {
      dispatch({ type: 'setBasket', value: result.draft });
      setReshuffling(false);
    }, 420);
  }, [variant, state, products, baskets, dispatch]);

  if (!basket) {
    return (
      <StepShell hideNav>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg text-ink-muted">
            עוד לא הרכבנו מארז. נחזור שלב אחורה ונשלים את התשובות.
          </p>
        </div>
      </StepShell>
    );
  }

  const swapTarget =
    picker.kind === 'swap'
      ? products.find((p) => p.id === picker.productId)
      : undefined;

  const pickerProducts =
    picker.kind === 'add'
      ? suggestAdditions(state, basket, products)
      : picker.kind === 'swap'
        ? swapCandidates(state, basket, picker.productId, products)
        : [];

  return (
    <StepShell wide nextLabel="ממשיכים לברכה" onNext={next}>
      {/* Phones read straight down — image, name, why, price, items, edit.
          Desktop keeps the two columns. `order` does the rearranging so the
          markup stays in one logical sequence. */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        {/* --- The basket, as a thing you can look at --------------------- */}
        <div className="order-1 overflow-hidden rounded-panel border border-line bg-surface shadow-soft lg:order-none">
          <div className="relative aspect-16/10 overflow-hidden">
            <ProductImage
              src={basket.image}
              alt={basket.name}
              category={lines[0]?.category ?? 'personalized'}
              emphasis
              className={cn(
                'size-full transition-opacity duration-300',
                reshuffling && 'opacity-40'
              )}
              sizes="(max-width: 1024px) 100vw, 55vw"
            />

            {basket.sourceBasketId && (
              <span className="absolute end-4 top-4 rounded-pill bg-surface/90 px-3 py-1.5 text-[0.75rem] font-semibold text-gold-deep shadow-soft backdrop-blur-sm">
                מארז מוכן של איריס
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 p-6">
            <h2 className="text-title text-[1.75rem]">{basket.name}</h2>
            <p className="leading-relaxed text-ink-muted">{basket.rationale}</p>
          </div>
        </div>

        {/* --- What's inside, and the live total -------------------------- */}
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <div className="order-3 rounded-panel border border-line bg-surface p-6 shadow-soft lg:order-none">
            <h3 className="text-heading mb-1">מה יש במארז</h3>
            <p className="mb-2 text-[0.875rem] text-ink-muted">
              אפשר להחליף או להסיר כל פריט
            </p>

            <ul
              /* Re-keying on the basket identity replays the stagger whenever a
                 different basket is proposed. */
              key={`${basket.name}-${basket.items.length}`}
              className={cn(
                'stagger transition-opacity duration-300',
                reshuffling && 'opacity-40'
              )}
            >
              {lines.map((product) => (
                <BasketItemRow
                  key={product.id}
                  product={product}
                  canRemove={lines.length > 1}
                  onSwap={() =>
                    setPicker({ kind: 'swap', productId: product.id })
                  }
                  leaving={leavingId === product.id}
                  onRemove={() => removeItem(product.id)}
                />
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setPicker({ kind: 'add' })}
              className="mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-card border border-dashed border-line-strong text-[0.9375rem] font-medium text-ink-soft transition-colors duration-200 hover:border-gold hover:bg-gold-wash hover:text-gold-deep"
            >
              <Icon name="plus" size={18} />
              הוספת מוצר
            </button>
          </div>

          {/* The number that changes as they edit. On phones it sits above
              the item list — "what does this cost" is the question being
              asked, and it should not need a scroll to answer. */}
          <div className="order-2 rounded-panel border border-gold-soft bg-gold-wash/60 p-6 lg:order-none">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-display text-lg font-semibold text-ink">
                סה"כ
              </span>
              <span
                /* Announced so the total change is heard, not only seen.
                   Keying on the value replays the pop on every change. */
                key={total}
                aria-live="polite"
                className="anim-pop font-display text-3xl font-semibold text-ink tabular-nums"
              >
                {formatPrice(total)}
              </span>
            </div>

            <p className="mt-2 text-[0.875rem] text-ink-muted">
              {basket.basePrice
                ? 'מחיר המארז המוכן. כל שינוי יעדכן את הסכום לפי הפריטים.'
                : `${lines.length} פריטים · המחיר מתעדכן עם כל שינוי`}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={suggestAnother}
            disabled={reshuffling}
            className="order-4 w-full lg:order-none"
          >
            <Icon name="swap" size={18} />
            {reshuffling ? 'מרכיבים מארז אחר…' : 'הציעו לי מארז אחר'}
          </Button>
        </div>
      </div>

      <ProductPicker
        open={picker.kind !== 'closed'}
        title={picker.kind === 'swap' ? 'במה להחליף?' : 'מה להוסיף למארז?'}
        subtitle={
          picker.kind === 'swap' && swapTarget
            ? `במקום ${swapTarget.name}`
            : 'הצעות שמתאימות לתשובות שלכם'
        }
        products={pickerProducts}
        compareTo={swapTarget?.price}
        onClose={() => setPicker({ kind: 'closed' })}
        onPick={(product) => {
          if (picker.kind === 'swap') {
            dispatch({
              type: 'swapItem',
              productId: picker.productId,
              withProductId: product.id,
            });
          } else {
            dispatch({ type: 'addItem', productId: product.id });
          }
          setPicker({ kind: 'closed' });
        }}
      />
    </StepShell>
  );
}
