'use client';

import Link from 'next/link';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { normalizeWhatsAppNumber } from '@/lib/order';
import { useStore } from '@/lib/store-context';

export function SiteFooter() {
  const { settings } = useStore();
  const tel = settings.storePhone.replace(/\D/g, '');
  const wa = normalizeWhatsAppNumber(settings.whatsappNumber);

  const social: { icon: IconName; label: string; href: string }[] = [
    { icon: 'whatsapp', label: 'וואטסאפ', href: `https://wa.me/${wa}` },
    { icon: 'facebook', label: 'פייסבוק', href: settings.facebookUrl },
    { icon: 'messenger', label: 'מסנג׳ר', href: settings.messengerUrl },
  ];

  return (
    <footer className="border-t border-line bg-canvas-deep">
      <div className="shell grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo href={null} />
          <p className="max-w-xs text-[0.9375rem] leading-relaxed text-ink-muted">
            חנות מתנות בקריית אתא. מארזים לחתן ולכלה, לחינה, לשבת קודש, לבר
            מצווה, ליולדת ולכל רגע שראוי למתנה טובה.
          </p>

          <ul className="mt-1 flex gap-2">
            {social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-soft transition-[border-color,color,transform] duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-gold hover:text-gold-deep"
                >
                  <Icon name={item.icon} size={19} label={item.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-ink">יצירת קשר</h2>
          <a
            className="flex min-h-11 w-fit items-center gap-2 text-ink-muted transition-colors duration-200 hover:text-ink"
            href={`tel:${tel}`}
          >
            <Icon name="phone" size={17} />
            <span dir="ltr">{settings.storePhone}</span>
          </a>
          <p className="flex items-start gap-2 text-ink-muted">
            <Icon name="store" size={17} className="mt-1 shrink-0" />
            {settings.storeAddress}
          </p>
          <Link
            className="flex min-h-11 w-fit items-center text-ink-muted transition-colors duration-200 hover:text-ink"
            href="/#visit"
          >
            איך מגיעים
          </Link>
        </div>

        <nav aria-labelledby="footer-shop" className="flex flex-col gap-3">
          <h2 id="footer-shop" className="font-display font-semibold text-ink">
            החנות
          </h2>
          <Link
            className="flex min-h-11 w-fit items-center text-ink-muted transition-colors duration-200 hover:text-ink"
            href="/#builder"
          >
            בניית מארז אישי
          </Link>
          <Link
            className="flex min-h-11 w-fit items-center text-ink-muted transition-colors duration-200 hover:text-ink"
            href="/baskets"
          >
            מארזים מוכנים
          </Link>
          <Link
            className="flex min-h-11 w-fit items-center text-ink-muted transition-colors duration-200 hover:text-ink"
            href="/#about"
          >
            אודותינו
          </Link>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-6 text-[0.8125rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} איריס מתנות ועיצובים</p>
          <p>המוצרים והמחירים באתר הם תוכן לדוגמה.</p>
        </div>
      </div>
    </footer>
  );
}
