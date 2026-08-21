'use client';

import Link from 'next/link';

import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { occasionLabels } from '@/data/taxonomy';
import { formatPrice } from '@/lib/order';
import { basketPrice } from '@/lib/recommendation';
import { cn } from '@/lib/utils';
import type { PredefinedBasket, Product } from '@/types';

/* A card in the ready-made catalogue. The whole card is the link, so there is
   one hit target rather than a card plus a small button inside it. */
export function BasketCard({
  basket,
  products,
  delay = 0,
}: {
  basket: PredefinedBasket;
  products: Product[];
  delay?: number;
}) {
  const price = basketPrice(basket, products);
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = basket.productIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));

  return (
    <Link
      href={`/baskets/${basket.id}`}
      style={{ '--d': delay } as React.CSSProperties}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-soft',
        'transition-[box-shadow,border-color,transform] duration-300 ease-out-soft',
        'hover:-translate-y-1 hover:border-gold-soft hover:shadow-lift'
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <ProductImage
          src={basket.image}
          alt={basket.name}
          category={items[0]?.category ?? 'personalized'}
          emphasis
          className="size-full transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {basket.featured && (
          <span className="absolute end-3 top-3 rounded-pill bg-surface/90 px-3 py-1 text-[0.75rem] font-semibold text-gold-deep shadow-soft backdrop-blur-sm">
            מבוקש
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-heading">{basket.name}</h3>

        <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
          {basket.description}
        </p>

        <ul className="flex flex-wrap gap-1.5" aria-label="מתאים לאירועים">
          {basket.occasions.slice(0, 3).map((occasion) => (
            <li
              key={occasion}
              className="rounded-pill border border-line bg-canvas px-2.5 py-1 text-[0.75rem] text-ink-muted"
            >
              {occasionLabels[occasion]}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <span className="font-display text-xl font-semibold text-ink">
            {formatPrice(price)}
          </span>
          <span className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-gold-deep">
            לבחירת המארז
            <Icon
              name="arrow-left"
              size={16}
              className="transition-transform duration-300 ease-out-soft group-hover:-translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
