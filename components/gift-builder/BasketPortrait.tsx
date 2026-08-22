'use client';

import { Icon, type IconName } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { cn } from '@/lib/utils';
import type { BasketDraft, CategoryId, Product } from '@/types';

/* ==========================================================================
   A picture of the basket the answers built.

   A basket taken whole from the shop's own sets has a photograph, and that is
   what shows. A basket assembled from the answers has no photograph of
   itself — it has never existed before this moment — so this composes one out
   of the things actually in it: the hero item large, the rest beside it. The
   customer sees their own basket rather than a stock shot of somebody else's.

   Most of the catalogue has no photography yet, so an item without a picture
   is drawn rather than faked: its category mark, its name, and the wash that
   category carries everywhere else on the site. A tile that says "יין אדום
   יקב בוטיק" under a wine mark tells the customer what is in the basket; a
   stock photograph of somebody else's bottle would only look like it did.
   ========================================================================== */

const CATEGORY_ICON: Record<CategoryId, IconName> = {
  towels: 'towel',
  robe: 'robe',
  skincare: 'cream',
  candles: 'candle',
  sweets: 'chocolate',
  wine: 'wine',
  homeware: 'cup',
  judaica: 'scroll',
  personalized: 'tag',
};

const CATEGORY_WASH: Record<CategoryId, string> = {
  towels: 'from-[#dde7ef] to-[#f2ece1]',
  robe: 'from-[#f0ded9] to-[#f8efe6]',
  skincare: 'from-[#d9ebe2] to-[#f4ede2]',
  candles: 'from-[#eedfc7] to-[#f8f0e3]',
  sweets: 'from-[#ecd9d1] to-[#f7ece0]',
  wine: 'from-[#e1d9ea] to-[#f5ece1]',
  homeware: 'from-[#dde7d9] to-[#f5eee2]',
  judaica: 'from-[#e9dfc9] to-[#f7f0e2]',
  personalized: 'from-[#e4dfec] to-[#f6eee2]',
};

/** One item, as a panel. `lead` is the large tile the arrangement is built
    around, so it carries a bigger mark and room for a longer name. */
function Tile({ product, lead = false }: { product: Product; lead?: boolean }) {
  if (product.image) {
    return (
      <div className="relative size-full overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          emphasis={lead}
          className="size-full"
          sizes={lead ? '(max-width: 1024px) 60vw, 32vw' : '(max-width: 1024px) 40vw, 22vw'}
        />
        <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/70 to-transparent px-3 pb-2 pt-6 text-[0.75rem] font-medium text-canvas">
          {product.name}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br px-3 text-center',
        CATEGORY_WASH[product.category]
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex items-center justify-center rounded-full bg-surface/70 text-gold-deep shadow-soft',
          lead ? 'size-16' : 'size-10'
        )}
      >
        <Icon
          name={CATEGORY_ICON[product.category]}
          size={lead ? 32 : 20}
          strokeWidth={1.3}
        />
      </span>
      <span
        className={cn(
          'font-display font-semibold leading-tight text-ink',
          lead ? 'text-[0.9375rem] sm:text-[1.0625rem]' : 'text-[0.75rem]'
        )}
      >
        {product.name}
      </span>
    </div>
  );
}

interface BasketPortraitProps {
  basket: BasketDraft;
  lines: Product[];
  /** Dimmed while a different basket is being proposed. */
  muted?: boolean;
  className?: string;
}

export function BasketPortrait({
  basket,
  lines,
  muted = false,
  className,
}: BasketPortraitProps) {
  /* The store's own basket photography wins whenever it exists. */
  const photograph = basket.sourceBasketId && basket.image ? basket.image : '';

  /* Otherwise: the hero item leads, then the rest in basket order. Four tiles
     is the most that stays legible at this size — beyond that each one is a
     thumbnail and the arrangement reads as a contact sheet. */
  const ordered = [...lines].sort(
    (a, b) => Number(Boolean(b.hero)) - Number(Boolean(a.hero)) || b.price - a.price
  );
  const [lead, ...rest] = ordered;
  const beside = rest.slice(0, 3);

  return (
    <div
      className={cn(
        'relative aspect-4/3 overflow-hidden bg-canvas-deep transition-opacity duration-300 sm:aspect-16/10',
        muted && 'opacity-40',
        className
      )}
    >
      {photograph ? (
        <ProductImage
          src={photograph}
          alt={basket.name}
          category={lines[0]?.category ?? 'personalized'}
          emphasis
          className="size-full"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      ) : (
        <div
          className={cn(
            'grid size-full gap-px bg-line',
            beside.length > 0 ? 'grid-cols-[1.35fr_1fr]' : 'grid-cols-1'
          )}
        >
          {lead && <Tile product={lead} lead />}

          {beside.length > 0 && (
            <div
              className={cn(
                'grid size-full gap-px',
                beside.length === 1
                  ? 'grid-rows-1'
                  : beside.length === 2
                    ? 'grid-rows-2'
                    : 'grid-rows-3'
              )}
            >
              {beside.map((product) => (
                <Tile key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* One warm glaze over the whole thing, so a composed arrangement reads
          as a single object rather than as separate tiles butted together. */}
      {!photograph && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,253,250,0.10)_0%,rgba(164,129,63,0.08)_100%)]"
        />
      )}

      <span className="absolute start-4 top-4 rounded-pill bg-surface/90 px-3 py-1.5 text-[0.75rem] font-semibold text-gold-deep shadow-soft backdrop-blur-sm">
        {basket.sourceBasketId ? 'מארז מוכן של איריס' : 'המארז שהרכבנו לכם'}
      </span>

      {/* Says out loud that the picture is the basket's own contents. */}
      {!photograph && lines.length > 0 && (
        <span className="absolute bottom-3 end-4 hidden rounded-pill bg-ink/55 px-3 py-1 text-[0.75rem] font-medium text-canvas backdrop-blur-sm sm:inline-flex">
          {lines.length} פריטים במארז
        </span>
      )}
    </div>
  );
}
