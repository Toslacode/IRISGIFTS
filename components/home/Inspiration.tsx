'use client';

import { Reveal } from '@/components/ui/Reveal';

/* ==========================================================================
   A short look at what the studio makes, and nothing more.

   This is not a catalogue and carries no prices or buttons — its only job is
   to show the style and finish before the questions begin. Every card is one
   image and one line.
   ========================================================================== */

const cards: { src: string; label: string; span?: string }[] = [
  { src: '/images/inspiration-1.webp', label: 'מארז לכלה' },
  { src: '/images/inspiration-2.webp', label: 'מארז לזוג' },
  { src: '/images/inspiration-3.webp', label: 'מארז ליולדת' },
  { src: '/images/inspiration-4.webp', label: 'מארז שבת חתן' },
  { src: '/images/inspiration-5.webp', label: 'מארז מפנק' },
  { src: '/images/inspiration-6.webp', label: 'מארז בהתאמה אישית' },
];

export function Inspiration() {
  return (
    <section id="inspiration" className="shell py-14 sm:py-16">
      <Reveal className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-title">קצת השראה</h2>
        <p className="text-lg text-ink-muted">
          כמה מהמארזים שאפשר ליצור אצל איריס
        </p>
      </Reveal>

      {/* Two up on phones, three from tablet on. Six across fits in one band
          but leaves each photo under 200px — too small for a section whose
          only job is to show finish and quality. */}
      <ul className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
        {cards.map((card, index) => (
          <Reveal as="li" key={card.label} delay={index % 3}>
            <figure className="group m-0 flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-panel border border-line bg-surface shadow-soft transition-[box-shadow,border-color] duration-300 ease-out-soft group-hover:border-gold-soft group-hover:shadow-lift">
                <div className="aspect-3/4 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    alt={card.label}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="size-full object-cover transition-transform duration-[600ms] ease-out-soft group-hover:scale-[1.04]"
                  />
                </div>
              </div>
              <figcaption className="text-center text-[0.875rem] font-medium text-ink-soft">
                {card.label}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
