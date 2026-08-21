'use client';

import Link from 'next/link';

import { Button, ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { occasionLabels, recipientLabels, styleLabels } from '@/data/taxonomy';
import { basketEnquiryLink, formatPrice } from '@/lib/order';
import { basketPrice } from '@/lib/recommendation';
import { useStore } from '@/lib/store-context';
import type { Product } from '@/types';

/* One ready-made basket in full: what's inside, what it costs, and two ways
   forward — send it as-is, or use it as the starting point for a custom one. */
export function BasketDetail({ id }: { id: string }) {
  const { baskets, products, settings } = useStore();
  const basket = baskets.find((b) => b.id === id && b.active);

  if (!basket) {
    return (
      <div className="shell flex flex-col items-center gap-6 py-28 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-canvas-deep text-ink-faint">
          <Icon name="basket" size={26} />
        </span>
        <h1 className="text-title">המארז הזה כבר לא זמין</h1>
        <p className="max-w-md text-lg text-ink-muted">
          יכול להיות שהוא הוחלף בגרסה חדשה. אפשר לראות את שאר המארזים, או
          לבנות אחד בהתאמה אישית.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/baskets">לכל המארזים</ButtonLink>
          <ButtonLink href="/build" variant="secondary">
            לבניית מארז אישי
          </ButtonLink>
        </div>
      </div>
    );
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  const items = basket.productIds
    .map((pid) => byId.get(pid))
    .filter((p): p is Product => Boolean(p));

  const price = basketPrice(basket, products);
  const itemsSum = items.reduce((sum, p) => sum + p.price, 0);
  const saving = itemsSum - price;

  /* Deep-link the builder with this basket's own tags pre-answered. */
  const customiseHref = `/build?${new URLSearchParams({
    ...(basket.recipients[0] ? { recipient: basket.recipients[0] } : {}),
    ...(basket.occasions[0] ? { occasion: basket.occasions[0] } : {}),
  })}`;

  return (
    <div className="shell py-10 sm:py-14">
      <nav aria-label="פירורי לחם" className="mb-8">
        <Link
          href="/baskets"
          className="inline-flex min-h-11 items-center gap-2 rounded-pill text-[0.9375rem] text-ink-muted transition-colors duration-200 hover:text-ink"
        >
          <Icon name="arrow-right" size={17} />
          לכל המארזים המוכנים
        </Link>
      </nav>

      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-soft">
          <div className="relative aspect-4/3">
            <ProductImage
              src={basket.image}
              alt={basket.name}
              category={items[0]?.category ?? 'personalized'}
              emphasis
              className="size-full"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-title">{basket.name}</h1>
            <p className="text-lg leading-relaxed text-ink-soft">
              {basket.description}
            </p>
          </div>

          <ul className="flex flex-wrap gap-1.5">
            {basket.recipients.slice(0, 2).map((r) => (
              <Tag key={r} label={recipientLabels[r]} />
            ))}
            {basket.occasions.slice(0, 3).map((o) => (
              <Tag key={o} label={occasionLabels[o]} />
            ))}
            {basket.styles.slice(0, 2).map((s) => (
              <Tag key={s} label={styleLabels[s]} />
            ))}
          </ul>

          <div className="rounded-panel border border-line bg-surface p-6 shadow-soft">
            <h2 className="text-heading mb-4">מה יש במארז</h2>
            <ul>
              {items.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-4 border-b border-line py-3 last:border-b-0"
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-card">
                    <ProductImage
                      src={product.image}
                      alt=""
                      category={product.category}
                      className="size-full"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-display font-semibold text-ink">
                      {product.name}
                    </span>
                    <span className="truncate text-[0.875rem] text-ink-muted">
                      {product.description}
                    </span>
                  </div>
                  <span className="shrink-0 tabular-nums text-ink-muted">
                    {formatPrice(product.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-panel border border-gold-soft bg-gold-wash/60 p-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-display text-lg font-semibold text-ink">
                מחיר המארז
              </span>
              <span className="font-display text-3xl font-semibold tabular-nums text-ink">
                {formatPrice(price)}
              </span>
            </div>
            {saving > 0 && (
              <p className="mt-2 text-[0.875rem] text-success">
                חיסכון של {formatPrice(saving)} לעומת רכישה בנפרד
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <ButtonLink
              href={basketEnquiryLink(basket.name, price, settings)}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              <Icon name="whatsapp" size={20} />
              לבחירת המארז
            </ButtonLink>

            <ButtonLink href={customiseHref} variant="secondary" size="lg">
              רוצים משהו אישי יותר? בנו מארז בהתאמה אישית
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <li className="rounded-pill border border-line bg-canvas px-3 py-1 text-[0.8125rem] text-ink-muted">
      {label}
    </li>
  );
}
