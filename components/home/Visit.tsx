'use client';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal, SplitWords } from '@/components/ui/Reveal';
import { normalizeWhatsAppNumber } from '@/lib/order';
import { useStore } from '@/lib/store-context';

/* ==========================================================================
   Where to find the shop.

   Every row here is an action rather than a label: the phone dials, the
   address opens maps, WhatsApp opens a chat. A decorative map image would
   look like a map and do nothing, so the address links out to the real one.
   ========================================================================== */

export function Visit() {
  const { settings } = useStore();

  const tel = settings.storePhone.replace(/\D/g, '');
  const wa = normalizeWhatsAppNumber(settings.whatsappNumber);
  const maps = `https://maps.google.com/?q=${encodeURIComponent(
    `${settings.storeAddress} איריס מתנות`
  )}`;

  const rows: {
    icon: IconName;
    label: string;
    value: string;
    href: string;
    external?: boolean;
  }[] = [
    {
      icon: 'store',
      label: 'הכתובת',
      value: settings.storeAddress,
      href: maps,
      external: true,
    },
    { icon: 'phone', label: 'טלפון', value: settings.storePhone, href: `tel:${tel}` },
    {
      icon: 'whatsapp',
      label: 'וואטסאפ',
      value: 'לשליחת הודעה',
      href: `https://wa.me/${wa}`,
      external: true,
    },
  ];

  return (
    <section id="visit" className="shell scroll-mt-20 py-16 sm:py-20">
      <div className="overflow-hidden rounded-panel border border-gold-soft bg-[radial-gradient(90%_120%_at_50%_0%,#fdf8ef_0%,#f6ecdb_100%)]">
        <div className="grid grid-cols-1 gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <Reveal className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">היכן אנו נמצאים</span>
              <h2 className="text-title">
                <SplitWords text="מוזמנים לקפוץ לחנות" />
              </h2>
              <p className="text-lg leading-relaxed text-ink-soft">
                אפשר להרכיב את המארז כאן באתר, ואפשר פשוט להגיע ולעצב אותו
                יחד עם איריס.
              </p>
            </div>

            <a
              href={`tel:${tel}`}
              className="flex min-h-14 w-fit items-center gap-3 rounded-pill bg-ink px-7 text-lg font-medium text-canvas shadow-soft transition-[background-color,box-shadow,transform] duration-200 ease-out-soft hover:bg-[#232741] hover:shadow-lift active:scale-[0.985]"
            >
              <Icon name="phone" size={19} />
              <span dir="ltr">{settings.storePhone}</span>
            </a>
          </Reveal>

          <Reveal delay={1}>
            <ul className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft">
              {rows.map((row) => (
                <li key={row.label} className="border-b border-line last:border-b-0">
                  <a
                    href={row.href}
                    {...(row.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="group flex min-h-16 items-center gap-4 px-5 py-3 transition-colors duration-200 hover:bg-gold-wash/60"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas-deep text-gold-deep transition-colors duration-200 group-hover:bg-surface">
                      <Icon name={row.icon} size={19} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[0.8125rem] text-ink-muted">
                        {row.label}
                      </span>
                      <span className="truncate font-medium text-ink">
                        {row.value}
                      </span>
                    </span>
                    <Icon
                      name="arrow-left"
                      size={17}
                      className="shrink-0 text-ink-faint transition-transform duration-300 ease-out-soft group-hover:-translate-x-1 group-hover:text-gold-deep"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
