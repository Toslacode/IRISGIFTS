'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { ProductImage } from '@/components/ui/ProductImage';
import { Icon } from '@/components/ui/Icon';
import { styles } from '@/data/taxonomy';
import { cn } from '@/lib/utils';
import type { CategoryId, StyleId } from '@/types';

/* Styles are a visual question, so these cards lead with imagery rather than
   a label and an icon. Each maps to a category whose placeholder wash reads
   closest to the mood. */
const STYLE_IMAGE: Record<StyleId, { src: string; category: CategoryId }> = {
  luxury: { src: '/images/style-luxury.webp', category: 'judaica' },
  clean: { src: '/images/style-clean.webp', category: 'towels' },
  romantic: { src: '/images/style-romantic.webp', category: 'robe' },
  pampering: { src: '/images/style-pampering.webp', category: 'skincare' },
  traditional: { src: '', category: 'homeware' },
  colorful: { src: '', category: 'sweets' },
};

export function StyleStep() {
  const { state, dispatch } = useBuilder();

  return (
    <StepShell
      wide
      blockedHint="בחרו סגנון אחד או שניים כדי להמשיך"
    >
      <div className="flex flex-col gap-4">
        <div
          role="group"
          aria-label="איזה סגנון אתם מחפשים — אפשר לבחור עד שניים"
          className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
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
                onClick={() =>
                  dispatch({ type: 'toggleStyle', value: option.id })
                }
                className={cn(
                  'group relative flex cursor-pointer flex-col overflow-hidden rounded-card border text-start',
                  'transition-[border-color,box-shadow,transform] duration-200 ease-out-soft',
                  'hover:-translate-y-0.5',
                  selected
                    ? 'border-gold shadow-gold'
                    : 'border-line shadow-soft hover:border-gold-soft hover:shadow-lift'
                )}
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <ProductImage
                    src={image.src}
                    alt={option.label}
                    category={image.category}
                    emphasis
                    className="size-full transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />

                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute end-3 top-3 flex size-7 items-center justify-center rounded-full',
                      'transition-[opacity,transform] duration-200 ease-out-soft',
                      selected
                        ? 'scale-100 bg-gold text-white opacity-100'
                        : 'scale-75 opacity-0'
                    )}
                  >
                    <Icon name="check" size={15} strokeWidth={2.4} />
                  </span>
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-1 p-4 transition-colors duration-200',
                    selected ? 'bg-gold-wash' : 'bg-surface'
                  )}
                >
                  <span className="font-display text-[1.0625rem] font-semibold text-ink">
                    {option.label}
                  </span>
                  {option.hint && (
                    <span className="text-[0.8125rem] leading-snug text-ink-muted">
                      {option.hint}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[0.875rem] text-ink-muted" aria-live="polite">
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
