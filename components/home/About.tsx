'use client';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal, SplitWords } from '@/components/ui/Reveal';
import { useStore } from '@/lib/store-context';

/* ==========================================================================
   Who Iris is, and what you get by ordering from her.

   Built from the shop's own reference layout rather than dropped in as the
   flat image of it: an ornament, the title, one short paragraph, then three
   value cards. As markup it reflows on a phone, the type stays sharp at any
   density, and the delivery areas can come from settings instead of being
   baked into a picture that goes stale.

   The ornaments — the sparkle, the diamond rules, the ribbons in the corners
   — are inline SVG for the same reason: they scale, they take their colour
   from the palette, and they weigh nothing.
   ========================================================================== */

interface Value {
  id: string;
  icon: IconName;
  title: string;
  body: string;
}

const values: Value[] = [
  {
    id: 'service',
    icon: 'wine',
    title: 'חוויית שירות',
    body: 'אנחנו מתאימים לכל לקוח מארז מדויק לפי האירוע, הסגנון והתקציב.',
  },
  {
    id: 'design',
    icon: 'basket',
    title: 'מתנות ייחודיות ומעוצבות',
    body: 'מבחר גדול של סלסלאות, מארזים ומתנות מעוצבות לחתונה, שבת חתן, יולדת ועוד.',
  },
  {
    id: 'delivery',
    icon: 'truck',
    title: 'משלוחים',
    body: 'אפשר להזמין בקלות ולקבל את המארז עד הבית או לכל יעד בארץ.',
  },
];

export function About() {
  const { settings } = useStore();

  return (
    <section
      id="about"
      className="relative isolate scroll-mt-20 overflow-hidden border-y border-gold-soft/60 bg-[radial-gradient(120%_90%_at_50%_0%,#fffdf9_0%,#fbf5ea_46%,#f6eddd_100%)] py-16 sm:py-24"
    >
      <Ribbons />

      <div className="shell relative flex flex-col items-center gap-10 text-center sm:gap-14">
        <Reveal className="flex flex-col items-center gap-5">
          <Sparkle />

          <h2 className="font-display text-[2rem] font-semibold leading-tight tracking-[0.04em] text-ink sm:text-[2.75rem]">
            <SplitWords text="אודותינו" />
          </h2>

          <Rule />

          <p className="max-w-2xl text-[1.0625rem] leading-loose text-ink-soft sm:text-lg">
            איריס מתנות היא חנות מתנות גדולה בקריית אתא, עם מבחר עצום של מארזים,
            סלסלאות ומתנות ייחודיות לכל אירוע. החנות הוקמה בשנת 2014 ומציעה
            ללקוחותיה חוויית קנייה אישית, שירות מכל הלב והתאמה לכל תקציב ואירוע.
          </p>
        </Reveal>

        <ul className="grid w-full grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {values.map((value, index) => (
            <Reveal as="li" key={value.id} delay={index} className="h-full">
              <article
                /* The delivery card is where the header's משלוחים link lands. */
                id={value.id === 'delivery' ? 'delivery' : undefined}
                className="group flex h-full scroll-mt-24 flex-col items-center gap-3.5 rounded-panel border border-gold-soft/70 bg-surface/80 px-6 py-8 text-center shadow-glass backdrop-blur-[2px] transition-[border-color,box-shadow,transform] duration-300 ease-out-soft hover:border-gold hover:shadow-glass-lift motion-safe:hover:-translate-y-1"
              >
                <span
                  aria-hidden="true"
                  className="flex size-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,#f7ecd7_0%,#f3e4cb_55%,rgba(243,228,203,0)_100%)] text-gold-deep transition-transform duration-300 ease-out-soft motion-safe:group-hover:scale-110"
                >
                  <Icon name={value.icon} size={30} strokeWidth={1.3} />
                </span>

                <h3 className="font-display text-[1.1875rem] font-semibold text-ink">
                  {value.title}
                </h3>

                <Rule small />

                <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
                  {value.body}
                </p>

                {value.id === 'delivery' && (
                  <ul className="mt-1 flex flex-wrap justify-center gap-1.5">
                    {settings.deliveryAreas.slice(0, 6).map((area) => (
                      <li
                        key={area}
                        className="rounded-pill border border-gold-soft/80 bg-gold-wash/70 px-2.5 py-1 text-[0.75rem] text-ink-soft"
                      >
                        {area}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --- ornaments --------------------------------------------------------- */

/** The scatter of stars above the title. */
function Sparkle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 46"
      className="h-8 w-44 text-gold sm:h-10 sm:w-52"
      fill="currentColor"
    >
      {/* A four-pointed star drawn as two crossed tapers, the shape the
          reference uses — not a circle and not a five-point star. */}
      <path d="M100 4c1.6 9.2 4.8 12.4 14 14-9.2 1.6-12.4 4.8-14 14-1.6-9.2-4.8-12.4-14-14 9.2-1.6 12.4-4.8 14-14Z" />
      <path
        d="M62 14c1 5.6 2.9 7.5 8.5 8.5-5.6 1-7.5 2.9-8.5 8.5-1-5.6-2.9-7.5-8.5-8.5 5.6-1 7.5-2.9 8.5-8.5Z"
        opacity="0.75"
      />
      <path
        d="M138 14c1 5.6 2.9 7.5 8.5 8.5-5.6 1-7.5 2.9-8.5 8.5-1-5.6-2.9-7.5-8.5-8.5 5.6-1 7.5-2.9 8.5-8.5Z"
        opacity="0.75"
      />
      <path
        d="M36 24c.6 3.4 1.7 4.5 5.1 5.1-3.4.6-4.5 1.7-5.1 5.1-.6-3.4-1.7-4.5-5.1-5.1 3.4-.6 4.5-1.7 5.1-5.1Z"
        opacity="0.5"
      />
      <path
        d="M164 24c.6 3.4 1.7 4.5 5.1 5.1-3.4.6-4.5 1.7-5.1 5.1-.6-3.4-1.7-4.5-5.1-5.1 3.4-.6 4.5-1.7 5.1-5.1Z"
        opacity="0.5"
      />
      <circle cx="18" cy="30" r="1.8" opacity="0.4" />
      <circle cx="182" cy="30" r="1.8" opacity="0.4" />
      <circle cx="80" cy="36" r="1.4" opacity="0.35" />
      <circle cx="120" cy="36" r="1.4" opacity="0.35" />
    </svg>
  );
}

/** Hairline, diamond, hairline — the divider the reference puts under every
    heading. */
function Rule({ small = false }: { small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 10"
      className={small ? 'h-2 w-24 text-gold' : 'h-2.5 w-40 text-gold sm:w-48'}
      fill="none"
      stroke="currentColor"
    >
      <path d="M0 5h66M94 5h66" strokeWidth="1" opacity="0.55" />
      <path d="m80 1 4 4-4 4-4-4 4-4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The gold ribbons that run through the bottom corners of the reference.
    Decorative, so they sit behind everything and never take a pointer. */
function Ribbons() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        className="absolute bottom-0 start-0 h-2/3 w-1/2 text-gold opacity-[0.28]"
        fill="none"
        stroke="currentColor"
      >
        <path d="M-20 300C60 250 40 170 130 140S300 120 420 40" strokeWidth="1.1" />
        <path d="M-20 270C70 215 30 150 150 118S320 92 420 10" strokeWidth="0.7" opacity="0.7" />
        <path d="M-20 232C90 190 60 132 176 100" strokeWidth="0.5" opacity="0.5" />
      </svg>

      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        className="absolute bottom-0 end-0 h-1/2 w-2/5 -scale-x-100 text-gold opacity-[0.2]"
        fill="none"
        stroke="currentColor"
      >
        <path d="M-20 300C60 250 40 170 130 140S300 120 420 40" strokeWidth="1.1" />
        <path d="M-20 270C70 215 30 150 150 118S320 92 420 10" strokeWidth="0.7" opacity="0.7" />
      </svg>
    </div>
  );
}
