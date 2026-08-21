'use client';

import { useMemo, useState } from 'react';

import { BasketCard } from '@/components/products/BasketCard';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { occasions } from '@/data/taxonomy';
import { useStore } from '@/lib/store-context';
import { cn } from '@/lib/utils';
import type { OccasionId } from '@/types';

/* The browse route, for customers who would rather look than be asked. */
export function BasketCatalog() {
  const { products, baskets } = useStore();
  const [filter, setFilter] = useState<OccasionId | 'all'>('all');

  const active = useMemo(() => baskets.filter((b) => b.active), [baskets]);

  /* Only offer filters that would actually return something. */
  const available = useMemo(() => {
    const present = new Set(active.flatMap((b) => b.occasions));
    return occasions.filter((o) => present.has(o.id));
  }, [active]);

  const shown = useMemo(
    () =>
      filter === 'all'
        ? active
        : active.filter((b) => b.occasions.includes(filter)),
    [active, filter]
  );

  return (
    <div className="shell py-14 sm:py-20">
      <Reveal className="flex flex-col items-center gap-4 text-center">
        <span className="eyebrow">מוכן לשליחה</span>
        <h1 className="text-display">מארזים מוכנים</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">
          המארזים שאנחנו מכינים הכי הרבה. כל אחד מהם אפשר להזמין כמו שהוא, או
          לשנות בהתאמה אישית.
        </p>
      </Reveal>

      {/* Filter rail — scrolls horizontally on mobile rather than wrapping
          into a wall of chips */}
      <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        <FilterChip
          label="הכול"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        {available.map((occasion) => (
          <FilterChip
            key={occasion.id}
            label={occasion.label}
            active={filter === occasion.id}
            onClick={() => setFilter(occasion.id)}
          />
        ))}
      </div>

      {shown.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((basket, index) => (
            <Reveal key={basket.id} delay={index % 3}>
              <BasketCard basket={basket} products={products} />
            </Reveal>
          ))}
        </div>
      ) : (
        /* Empty state — an exit, not a dead end */
        <div className="mt-16 flex flex-col items-center gap-4 rounded-panel border border-dashed border-line-strong bg-canvas-deep/50 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-canvas text-ink-faint">
            <Icon name="basket" size={26} />
          </span>
          <h2 className="text-heading">אין כרגע מארז מוכן לאירוע הזה</h2>
          <p className="max-w-md text-ink-muted">
            אבל אנחנו בונים מארזים לכל אירוע. ענו על כמה שאלות ונרכיב לכם אחד.
          </p>
          <ButtonLink href="/build" className="mt-2">
            לבניית מארז אישי
          </ButtonLink>
        </div>
      )}

      {/* The nudge back to the core product */}
      <section className="mt-20 overflow-hidden rounded-panel border border-gold-soft bg-[radial-gradient(80%_120%_at_50%_0%,#fdf8ef_0%,#f6ecdb_100%)] px-6 py-14 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
          <span className="flex size-13 items-center justify-center rounded-full border border-gold-soft bg-surface text-gold-deep">
            <Icon name="sparkle" size={24} />
          </span>
          <h2 className="text-title text-[1.75rem]">
            רוצים משהו אישי יותר?
          </h2>
          <p className="text-lg leading-relaxed text-ink-soft">
            בנו מארז בהתאמה אישית — לפי מי שיקבל אותו, האירוע והתקציב שלכם.
          </p>
          <ButtonLink href="/build" size="lg">
            בואו נתחיל
            <Icon name="arrow-left" size={18} />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-11 shrink-0 cursor-pointer rounded-pill border px-4 text-[0.9375rem] transition-colors duration-200',
        active
          ? 'border-gold bg-ink text-canvas'
          : 'border-line bg-surface text-ink-soft hover:border-gold-soft hover:bg-gold-wash hover:text-ink'
      )}
    >
      {label}
    </button>
  );
}
