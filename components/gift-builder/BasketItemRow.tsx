'use client';

import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/order';
import type { Product } from '@/types';

/* One line inside the recommended basket, with its two edit affordances.
   Both actions are labelled — icon-only controls announce nothing. */
export function BasketItemRow({
  product,
  onSwap,
  onRemove,
  canRemove,
}: {
  product: Product;
  onSwap: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <li className="flex items-center gap-4 border-b border-line py-4 last:border-b-0">
      <div className="size-16 shrink-0 overflow-hidden rounded-card sm:size-20">
        <ProductImage
          src={product.image}
          alt=""
          category={product.category}
          className="size-full"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Wraps instead of truncating: the name is what the customer is
            actually reading, and at 390px there is no room to clip it. */}
        <p className="font-display text-[1.0625rem] font-semibold leading-snug text-ink">
          {product.name}
        </p>
        <p className="truncate text-[0.875rem] text-ink-muted">
          {product.description}
        </p>
        <p className="text-[0.9375rem] font-medium text-gold-deep sm:hidden">
          {formatPrice(product.price)}
        </p>
      </div>

      <p className="hidden w-24 shrink-0 text-end font-display text-[1.0625rem] font-medium text-ink sm:block">
        {formatPrice(product.price)}
      </p>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onSwap}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-gold-wash hover:text-gold-deep"
        >
          <Icon name="swap" size={19} label={`החלפה של ${product.name}`} />
        </button>

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-danger-wash hover:text-danger disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
        >
          <Icon name="trash" size={18} label={`הסרה של ${product.name}`} />
        </button>
      </div>
    </li>
  );
}
