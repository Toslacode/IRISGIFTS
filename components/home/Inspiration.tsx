'use client';

import { Reveal } from '@/components/ui/Reveal';

/* ==========================================================================
   A short look at what the studio makes, and nothing more.

   Not a catalogue: no prices, no buttons. Its only job is to show the style
   and the finish before the questions begin.

   On phones this is a swipe rail rather than a shrunken grid — six cards in
   a two-column grid pushes the first question a screen and a half further
   down, and each photo ends up too small to read anyway.
   ========================================================================== */

const cards: { src: string; label: string }[] = [
  { src: '/images/inspiration-1.webp', label: 'מארז לכלה' },
  { src: '/images/inspiration-2.webp', label: 'מארז לזוג' },
  { src: '/images/inspiration-3.webp', label: 'מארז ליולדת' },
  { src: '/images/inspiration-4.webp', label: 'מארז שבת חתן' },
  { src: '/images/inspiration-5.webp', label: 'מארז מפנק' },
  { src: '/images/inspiration-6.webp', label: 'מארז בהתאמה אישית' },
];

export function Inspiration() {
  return (
    <section id="inspiration" className="scroll-mt-20 py-12 sm:py-16">
      <Reveal className="shell flex flex-col items-center gap-2 text-center">
        <h2 className="text-title">קצת השראה</h2>
        <p className="text-lg text-ink-muted">
          כמה מהמארזים שאפשר ליצור אצל איריס
        </p>
      </Reveal>

      {/* Phones: a snapping rail that bleeds off both edges, so the next card
          is visibly cut and the gesture is discoverable without a hint. */}
      <ul
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:hidden"
        aria-label="מארזים לדוגמה"
      >
        {cards.map((card, index) => (
          <li
            key={card.label}
            style={{ '--d': index } as React.CSSProperties}
            /* snap-start, not snap-center: at rest the first card should sit against
               the leading edge with the next one cut, not float in the middle. */
            className="anim-rise w-[72vw] max-w-[19rem] shrink-0 snap-start"
          >
            <Card {...card} sizes="68vw" />
          </li>
        ))}
      </ul>

      {/* Tablet and up: three across, so each photograph is large enough to
          judge the finish. */}
      <ul className="shell mt-9 hidden grid-cols-3 gap-5 sm:grid">
        {cards.map((card, index) => (
          <Reveal as="li" key={card.label} delay={index % 3}>
            <Card {...card} sizes="33vw" />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Card({
  src,
  label,
  sizes,
}: {
  src: string;
  label: string;
  sizes: string;
}) {
  return (
    <figure className="group m-0 flex flex-col gap-3">
      <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-soft transition-[box-shadow,border-color] duration-300 ease-out-soft group-hover:border-gold-soft group-hover:shadow-lift">
        <div className="aspect-3/4 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={label}
            loading="lazy"
            decoding="async"
            sizes={sizes}
            className="size-full object-cover transition-transform duration-[600ms] ease-out-soft group-hover:scale-[1.04]"
          />
        </div>
      </div>
      <figcaption className="text-center text-[0.875rem] font-medium text-ink-soft">
        {label}
      </figcaption>
    </figure>
  );
}
