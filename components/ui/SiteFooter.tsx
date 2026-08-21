'use client';

import Link from 'next/link';

import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { useStore } from '@/lib/store-context';

export function SiteFooter() {
  const { settings } = useStore();

  return (
    <footer className="border-t border-line bg-canvas-deep">
      <div className="shell grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo href={null} />
          <p className="max-w-xs text-[0.9375rem] leading-relaxed text-ink-muted">
            מארזי מתנה בהתאמה אישית — לכלה, לחתן, ליולדת, לחג ולכל רגע שראוי
            למתנה טובה.
          </p>
        </div>

        <nav aria-labelledby="footer-shop" className="flex flex-col gap-3">
          <h2 id="footer-shop" className="font-display font-semibold text-ink">
            החנות
          </h2>
          <Link className="flex min-h-11 w-fit items-center text-ink-muted transition-colors duration-200 hover:text-ink" href="/#builder">
            בניית מארז אישי
          </Link>
          <Link className="flex min-h-11 w-fit items-center text-ink-muted transition-colors duration-200 hover:text-ink" href="/baskets">
            מארזים מוכנים
          </Link>
          <Link className="flex min-h-11 w-fit items-center text-ink-muted transition-colors duration-200 hover:text-ink" href="/admin">
            ניהול החנות
          </Link>
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-ink">יצירת קשר</h2>
          <a
            className="flex min-h-11 w-fit items-center gap-2 text-ink-muted transition-colors duration-200 hover:text-ink"
            href={`tel:${settings.storePhone.replace(/\D/g, '')}`}
          >
            <Icon name="phone" size={17} />
            {settings.storePhone}
          </a>
          <p className="flex items-start gap-2 text-ink-muted">
            <Icon name="store" size={17} className="mt-1 shrink-0" />
            {settings.storeAddress}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-ink">אזורי משלוח</h2>
          <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
            {settings.deliveryAreas.slice(0, 6).join(' · ')}
            {settings.deliveryAreas.length > 6 && ' ועוד'}
          </p>
          {settings.pickupAvailable && (
            <p className="text-[0.9375rem] text-ink-muted">
              וגם איסוף עצמי מהחנות
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-6 text-[0.8125rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} IRISGIFTS</p>
          <p>
            אתר הדגמה — המוצרים, המחירים ופרטי הקשר הם תוכן לדוגמה.
          </p>
        </div>
      </div>
    </footer>
  );
}
