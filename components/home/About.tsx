'use client';

import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';

/* ==========================================================================
   Who Iris is.

   The shop has run since 2014 and every basket is composed by hand, which is the
   whole argument for the guided flow above — so this sits under it rather
   than in front of it. Written as a short lead and a row of what the shop
   actually makes, not the paragraph-block the old site carried.
   ========================================================================== */

const MAKES = [
  'מארזי חתן וכלה',
  'חינה ומקווה',
  'שבת קודש',
  'בר מצווה',
  'מארזים ליולדת',
  'מתנות לחג',
];

export function About() {
  return (
    <section id="about" className="shell scroll-mt-20 py-16 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        {/* The photograph carries the craft claim; the copy stays short. */}
        <Reveal className="order-1 lg:order-none">
          <div className="relative">
            <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-lift">
              <div className="aspect-4/5 overflow-hidden sm:aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/inspiration-1.webp"
                  alt="מארז מתנה שהורכב בחנות"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="size-full object-cover"
                />
              </div>
            </div>

            {/* A quiet credential plate, overlapping the photograph */}
            <div className="absolute -bottom-5 start-5 flex items-center gap-3 rounded-pill border border-gold-soft bg-surface px-5 py-3 shadow-lift">
              <span className="flex size-9 items-center justify-center rounded-full bg-gold-wash text-gold-deep">
                <Icon name="sparkle" size={18} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg font-semibold text-ink">
                  משנת 2014
                </span>
                <span className="text-[0.75rem] text-ink-muted">
                  בקריית אתא
                </span>
              </span>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-6">
          <Reveal className="flex flex-col gap-3" delay={1}>
            <span className="eyebrow">אודותינו</span>
            <h2 className="text-title">
              איריס מרכיבה כל מארז בעצמה
            </h2>
            <p className="text-lg leading-relaxed text-ink-soft">
              חנות מתנות בקריית אתא, ברחוב העצמאות 27. איריס — הבעלים — מעצבת
              את הסלסלאות והמארזים שבחנות בעצמה, ובוחרת כל פריט שנכנס אליהם.
            </p>
          </Reveal>

          <Reveal delay={2}>
            <p className="text-[0.9375rem] font-medium text-ink-muted">
              מה אנחנו מכינים
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {MAKES.map((item, index) => (
                <li
                  key={item}
                  style={{ '--d': index } as React.CSSProperties}
                  className="anim-rise rounded-pill border border-line bg-surface px-4 py-2 text-[0.9375rem] text-ink-soft shadow-soft transition-[border-color,color] duration-200 hover:border-gold-soft hover:text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
