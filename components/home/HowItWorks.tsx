import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal, SectionHeading } from '@/components/ui/Reveal';

/* Three steps. Genuinely a sequence, so numbered markers earn their place. */
const steps: { icon: IconName; title: string; copy: string }[] = [
  {
    icon: 'sparkle',
    title: 'עונים על כמה שאלות',
    copy: 'למי המתנה, מה האירוע, מה התקציב ומה הסגנון. לוקח פחות משתי דקות.',
  },
  {
    icon: 'basket',
    title: 'מקבלים מארז מוכן',
    copy: 'אנחנו מרכיבים הצעה שמתאימה לתשובות שלכם. אפשר להחליף, להוסיף ולהסיר.',
  },
  {
    icon: 'whatsapp',
    title: 'שולחים לאיריס',
    copy: 'ההזמנה מגיעה אליה מלאה — בלי עשרים הודעות של שאלות ותשובות.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-canvas-deep py-24 sm:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="איך זה עובד"
          title="שלושה צעדים, בלי שיחות מיותרות"
        />

        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index}>
              <div className="flex h-full flex-col gap-4 rounded-panel border border-line bg-surface p-8 shadow-soft">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-wash text-gold-deep">
                    <Icon name={step.icon} size={22} />
                  </span>
                  <span
                    className="font-display text-3xl font-light text-gold-soft"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-heading">{step.title}</h3>
                <p className="leading-relaxed text-ink-muted">{step.copy}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
