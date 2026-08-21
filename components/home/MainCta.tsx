import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';

/* The moment the page has been building toward. Full-bleed, one intent. */
export function MainCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_0%,#fdf8ef_0%,#f6ecdb_48%,#efe1c9_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-l from-transparent via-gold-soft to-transparent"
      />

      <div className="shell-narrow flex flex-col items-center gap-7 text-center">
        <Reveal className="flex flex-col items-center gap-7">
          <span className="flex size-14 items-center justify-center rounded-full border border-gold-soft bg-surface text-gold-deep shadow-soft">
            <Icon name="gift" size={26} />
          </span>

          <h2 className="text-title">רוצים שנבנה לכם את המתנה?</h2>

          <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
            ענו על כמה שאלות קצרות ואנחנו נתאים לכם מארז לפי האדם, האירוע
            והתקציב
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/build" size="lg">
              בואו נתחיל
              <Icon name="arrow-left" size={18} />
            </ButtonLink>
            <ButtonLink href="/baskets" variant="secondary" size="lg">
              לצפייה במארזים מוכנים
            </ButtonLink>
          </div>

          <p className="text-[0.875rem] text-ink-muted">
            אין צורך בהרשמה · אפשר לחזור אחורה בכל שלב
          </p>
        </Reveal>
      </div>
    </section>
  );
}
