'use client';

import { useId, useState } from 'react';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal, SplitWords } from '@/components/ui/Reveal';
import { useStore } from '@/lib/store-context';
import { cn } from '@/lib/utils';

/* ==========================================================================
   The three promises the shop makes.

   Each card carries one line. The rest is behind a disclosure, so the section
   reads at a glance and rewards the one card a given customer actually cares
   about — the delivery card opens onto the real areas from settings rather
   than a sentence saying areas are limited.
   ========================================================================== */

interface Pillar {
  icon: IconName;
  title: string;
  lead: string;
  detail: string;
  /** Renders the live delivery-area list inside the disclosure. */
  areas?: boolean;
}

const pillars: Pillar[] = [
  {
    icon: 'store',
    title: 'חוויית שירות',
    lead: 'מגיעים לחנות ומעצבים את המארז יחד',
    detail:
      'לקוחות שבוחרים להגיע אלינו יושבים עם איריס ומרכיבים סלסלה או מארז לפי הבחירה והתקציב שלהם בלבד — בלי חבילות קבועות ובלי לחץ.',
  },
  {
    icon: 'gift',
    title: 'מתנות ייחודיות ומעוצבות',
    lead: 'אריזה מרשימה, בלי תוספת עלות',
    detail:
      'בוחרים את המוצרים, בוחרים סלסלה או מארז מתוך מבחר גדול, ואנחנו עוטפים ומעצבים את המתנה באריזה מרשימה — ללא תוספת תשלום.',
  },
  {
    icon: 'truck',
    title: 'משלוח או איסוף',
    lead: 'משלוח עד הבית, או איסוף עצמי מהחנות',
    detail:
      'מארזי בר מצווה נשלחים לכל הארץ. עבור מארזי חתן וכלה אזורי המשלוח מוגבלים כרגע — אלה האזורים שאנחנו מחלקים אליהם היום:',
    areas: true,
  },
];

export function Pillars() {
  return (
    <section className="border-y border-line bg-canvas-deep py-16 sm:py-20">
      <div className="shell">
        <Reveal className="flex flex-col items-center gap-2 text-center">
          <span className="eyebrow">איך זה עובד אצלנו</span>
          <h2 className="text-title">
            <SplitWords text="שלוש דרכים לקבל מארז" />
          </h2>
        </Reveal>

        <ul /* items-start so opening one card does not stretch the other two
            into tall empty boxes. */
          className="mt-10 grid grid-cols-1 items-start gap-4 md:grid-cols-3 md:gap-5">
          {pillars.map((pillar, index) => (
            <Reveal as="li" key={pillar.title} delay={index}>
              <PillarCard pillar={pillar} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const [open, setOpen] = useState(false);
  const { settings } = useStore();
  const panelId = useId();

  return (
    <div
      className={cn(
        'group flex flex-col gap-4 rounded-panel border bg-surface p-6 shadow-soft',
        'transition-[border-color,box-shadow,transform] duration-300 ease-out-soft',
        open
          ? 'border-gold-soft shadow-lift'
          : 'border-line hover:-translate-y-1 hover:border-gold-soft hover:shadow-lift'
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-gold-wash text-gold-deep transition-transform duration-300 ease-out-soft motion-safe:group-hover:scale-110">
        <Icon name={pillar.icon} size={22} />
      </span>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-heading">{pillar.title}</h3>
        <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
          {pillar.lead}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="mt-auto flex min-h-11 w-fit cursor-pointer items-center gap-1.5 rounded-pill text-[0.9375rem] font-semibold text-gold-deep transition-colors duration-200 hover:text-ink"
      >
        {open ? 'סגירה' : 'עוד על זה'}
        <Icon
          name="arrow-left"
          size={16}
          className={cn(
            'transition-transform duration-300 ease-out-soft',
            open ? '-rotate-90' : ''
          )}
        />
      </button>

      {/* Grid-rows trick: animates to the content's real height without a
          hardcoded max-height that clips longer copy. */}
      <div
        id={panelId}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-400 ease-out-soft',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p className="border-t border-line pt-4 text-[0.9375rem] leading-relaxed text-ink-soft">
            {pillar.detail}
          </p>

          {pillar.areas && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {settings.deliveryAreas.map((area) => (
                <li
                  key={area}
                  className="rounded-pill border border-gold-soft bg-gold-wash px-2.5 py-1 text-[0.8125rem] text-ink-soft"
                >
                  {area}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
