'use client';

import { Reveal, SplitWords } from '@/components/ui/Reveal';
import { useParallax } from '@/lib/useParallax';

/* ==========================================================================
   A short look at what the studio makes, and nothing more.

   Not a catalogue: no prices, no buttons. Its only job is to show the style
   and the finish before the questions begin.

   On phones this is a swipe rail rather than a shrunken grid — six cards in
   a two-column grid pushes the first question a screen and a half further
   down, and each photo ends up too small to read anyway.
   ========================================================================== */

/* The shop's own catalogue photography, not stills lifted from the film.
   Six different kinds of basket rather than six crops of one, so the section
   shows the range of the work instead of one arrangement six times. */
const cards: { src: string; label: string }[] = [
  { src: '/images/catalog/bride-shell-large.webp', label: 'מארז כלה בסלסלת צדף' },
  { src: '/images/catalog/groom-huge.webp', label: 'מארז חתן בהדום' },
  { src: '/images/catalog/henna-couple-large.webp', label: 'מארז חתן וכלה' },
  { src: '/images/catalog/barmitzva-kohanim.webp', label: 'סט לחתן בר מצווה' },
  { src: '/images/catalog/groom-basket.webp', label: 'מארז חתן בסלסלה' },
  { src: '/images/catalog/bride-set.webp', label: 'סט חלוק ונעלי בית' },
];

export function Inspiration() {
  return (
    <section id="inspiration" className="scroll-mt-20 py-12 sm:py-16">
      <Reveal className="shell flex flex-col items-center gap-2 text-center">
        <h2 className="text-title">
          <SplitWords text="קצת השראה" />
        </h2>
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

      {/* Tablet and up: two balanced rows of three, in a column narrower than
          the page. Run to the full shell width and each photograph becomes a
          towering slab that pushes the first question off the screen and
          leaves the section looking like it is falling off one side. */}
      <ul className="shell mx-auto mt-9 hidden w-full max-w-5xl grid-cols-3 gap-5 sm:grid">
        {cards.map((card, index) => (
          <Reveal as="li" key={card.label} delay={index % 3}>
            <Card {...card} sizes="(min-width: 1024px) 320px, 33vw" />
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
  /* The photograph drifts inside its frame as the rail scrolls past. Small
     enough that you read it as depth rather than as movement — the 12%
     overscale is there purely so the drift never uncovers an edge. */
  const driftRef = useParallax<HTMLDivElement>(14);

  return (
    <figure className="group m-0 flex flex-col gap-3">
      <div
        className={[
          'overflow-hidden rounded-panel border border-line bg-surface shadow-soft',
          'transition-[box-shadow,border-color,transform] duration-300 ease-out-soft',
          'group-hover:border-gold-soft group-hover:shadow-lift',
          'motion-safe:group-hover:-translate-y-1',
        ].join(' ')}
      >
        <div className="aspect-square overflow-hidden">
          {/* Two transforms, two elements: the drift follows the scroll frame
              by frame and must not be transitioned, while the hover scale
              must. Sharing one element would make the parallax rubbery. */}
          <div
            ref={driftRef}
            className="size-full will-change-transform motion-safe:translate-y-(--py)"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={label}
              loading="lazy"
              decoding="async"
              sizes={sizes}
              className="size-full scale-[1.12] object-cover transition-transform duration-[600ms] ease-out-soft group-hover:scale-[1.17]"
            />
          </div>
        </div>
      </div>
      <figcaption className="text-center text-[0.875rem] font-medium text-ink-soft">
        {label}
      </figcaption>
    </figure>
  );
}
