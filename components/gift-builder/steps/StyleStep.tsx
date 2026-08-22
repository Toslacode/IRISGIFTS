'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { ProductImage } from '@/components/ui/ProductImage';
import { Icon } from '@/components/ui/Icon';
import { styles } from '@/data/taxonomy';
import { cn } from '@/lib/utils';
import type { CategoryId, StyleId } from '@/types';

/* Styles are a visual question, so these cards lead with imagery: real
   baskets from the shop's own catalogue, one per style, because the customer
   is choosing a look and the tile has to show that look rather than a mood.

   "צבעוני ושמח" has no photograph. Every basket the shop has shot is white or
   silver, and labelling one of those colourful would be a lie the customer
   only finds out about on delivery — so it keeps the category wash instead,
   which reads as drawn rather than as a picture that failed to load. */
const STYLE_IMAGE: Record<StyleId, { src: string; category: CategoryId }> = {
  luxury: { src: '/images/catalog/bride-shell-large.webp', category: 'personalized' },
  clean: { src: '/images/catalog/bride-set.webp', category: 'robe' },
  romantic: { src: '/images/catalog/mikveh-shell-medium.webp', category: 'personalized' },
  pampering: { src: '/images/catalog/groom-robe-set.webp', category: 'robe' },
  traditional: { src: '/images/catalog/barmitzva-kohanim.webp', category: 'judaica' },
  colorful: { src: '', category: 'sweets' },
};

export function StyleStep() {
  const { state, dispatch } = useBuilder();

  return (
    <StepShell blockedHint="בחרו סגנון אחד או שניים כדי להמשיך">
      <div className="flex flex-col gap-3">
        <div
          role="group"
          aria-label="איזה סגנון אתם מחפשים — אפשר לבחור עד שניים"
          className="stagger grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6"
        >
          {styles.map((option) => {
            const selected = state.styles.includes(option.id);
            const image = STYLE_IMAGE[option.id];

            return (
              <button
                key={option.id}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => dispatch({ type: 'toggleStyle', value: option.id })}
                className={cn(
                  /* Phones use the same row shape as every other question —
                     a thumbnail where the icon would be — so the six styles
                     cost three short rows instead of three tall cards. */
                  'group relative flex w-full cursor-pointer items-center gap-2.5',
                  'min-h-[3.5rem] overflow-hidden rounded-card border px-3 py-2 text-start',
                  'sm:min-h-0 sm:flex-col sm:items-stretch sm:gap-0 sm:p-0',
                  'transition-[border-color,box-shadow,transform] duration-200 ease-out-soft',
                  'hover:-translate-y-0.5 active:scale-[0.98]',
                  selected
                    ? 'border-gold bg-gold-wash shadow-gold sm:bg-transparent'
                    : 'border-line bg-surface shadow-soft hover:border-gold-soft hover:shadow-lift'
                )}
              >
                <span className="relative size-9 shrink-0 overflow-hidden rounded-full sm:size-auto sm:w-full sm:rounded-none">
                  <span className="block aspect-square overflow-hidden sm:aspect-4/3 lg:aspect-square">
                    <ProductImage
                      src={image.src}
                      alt={option.label}
                      category={image.category}
                      emphasis
                      className="size-full transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 40px, (min-width: 1024px) 170px, 33vw"
                    />
                  </span>

                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute end-2 top-2 hidden size-6 items-center justify-center rounded-full sm:flex',
                      'transition-[opacity,transform] duration-200 ease-out-soft',
                      selected
                        ? 'scale-100 bg-gold text-white opacity-100'
                        : 'scale-75 opacity-0'
                    )}
                  >
                    <Icon name="check" size={15} strokeWidth={2.4} />
                  </span>
                </span>

                <span
                  className={cn(
                    'flex min-w-0 flex-1 flex-col gap-0.5 transition-colors duration-200',
                    'sm:flex-none sm:gap-1 sm:p-3 lg:p-2',
                    selected ? 'sm:bg-gold-wash' : 'sm:bg-surface'
                  )}
                >
                  <span className="font-display text-[0.9375rem] font-semibold leading-tight text-ink sm:text-[1rem] lg:text-[0.9375rem]">
                    {option.label}
                  </span>
                  {option.hint && (
                    <span className="hidden text-[0.75rem] leading-snug text-ink-muted sm:block lg:hidden">
                      {option.hint}
                    </span>
                  )}
                </span>

                {/* Row-layout tick, phones only */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full sm:hidden',
                    'transition-[opacity,transform] duration-200 ease-out-soft',
                    selected ? 'scale-100 bg-gold text-white opacity-100' : 'scale-75 opacity-0'
                  )}
                >
                  <Icon name="check" size={13} strokeWidth={2.4} />
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[0.8125rem] text-ink-muted sm:text-[0.875rem]" aria-live="polite">
          {state.styles.length === 0
            ? 'אפשר לבחור עד שני סגנונות'
            : state.styles.length === 1
              ? 'אפשר לבחור עוד סגנון אחד, או להמשיך'
              : 'בחרתם שני סגנונות — בחירה נוספת תחליף את הראשון'}
        </p>
      </div>
    </StepShell>
  );
}
