'use client';

import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/order';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

/* ==========================================================================
   The picker used for both "add a product" and "swap this one".

   A bottom sheet on mobile, a centred panel on desktop. Focus moves into it
   on open and Escape closes it — the brief asks to avoid popups, and this is
   the one place a layer genuinely beats a full page change, so it behaves
   properly rather than trapping anyone.
   ========================================================================== */

export function ProductPicker({
  open,
  title,
  subtitle,
  products,
  onPick,
  onClose,
  /** Shown on each row instead of the plain price, for swaps. */
  compareTo,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  products: Product[];
  onPick: (product: Product) => void;
  onClose: () => void;
  compareTo?: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    /* Stop the page behind from scrolling under the sheet */
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="סגירה"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'anim-rise relative flex max-h-[85dvh] w-full flex-col overflow-hidden bg-canvas shadow-lift',
          'rounded-t-panel sm:max-w-2xl sm:rounded-panel'
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-heading">{title}</h2>
            {subtitle && (
              <p className="text-[0.875rem] text-ink-muted">{subtitle}</p>
            )}
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="-me-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-canvas-deep hover:text-ink"
          >
            <Icon name="close" size={20} label="סגירה" />
          </button>
        </header>

        <div className="overflow-y-auto overscroll-contain px-6 py-4">
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-canvas-deep text-ink-faint">
                <Icon name="search" size={24} />
              </span>
              <p className="font-display text-lg font-semibold text-ink">
                אין כרגע מוצר מתאים להצעה
              </p>
              <p className="max-w-xs text-[0.9375rem] text-ink-muted">
                אפשר להסיר את הפריט ולהוסיף משהו אחר, או לבקש מארז אחר לגמרי.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {products.map((product) => {
                const diff =
                  compareTo === undefined ? null : product.price - compareTo;

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => onPick(product)}
                      className="flex w-full cursor-pointer items-center gap-4 border-b border-line py-3.5 text-start transition-colors duration-200 last:border-b-0 hover:bg-gold-wash/60"
                    >
                      <div className="size-14 shrink-0 overflow-hidden rounded-card">
                        <ProductImage
                          src={product.image}
                          alt=""
                          category={product.category}
                          className="size-full"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate font-display font-semibold text-ink">
                          {product.name}
                        </p>
                        <p className="truncate text-[0.875rem] text-ink-muted">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="font-display font-medium text-ink">
                          {formatPrice(product.price)}
                        </span>
                        {diff !== null && diff !== 0 && (
                          <span
                            className={cn(
                              'text-[0.75rem] font-medium',
                              diff > 0 ? 'text-danger' : 'text-success'
                            )}
                          >
                            {diff > 0 ? '+' : '−'}
                            {formatPrice(Math.abs(diff))}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-line px-6 py-4">
          <Button variant="secondary" onClick={onClose} className="w-full">
            סגירה
          </Button>
        </footer>
      </div>
    </div>
  );
}
