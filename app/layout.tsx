import type { Metadata, Viewport } from 'next';

import { StoreProvider } from '@/lib/store-context';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://irisgifts.co.il'),
  title: {
    default: 'IRISGIFTS — מארזי מתנה בהתאמה אישית',
    template: '%s · IRISGIFTS',
  },
  description:
    'ענו על כמה שאלות קצרות ואנחנו נרכיב לכם מארז מתנה שמתאים בדיוק לאדם, לאירוע ולתקציב שלכם.',
  keywords: [
    'מארזי מתנה',
    'מתנה לכלה',
    'מתנה ליולדת',
    'מארז חתן',
    'מתנות לחג',
    'מארז בהתאמה אישית',
  ],
  openGraph: {
    title: 'IRISGIFTS — המתנה המושלמת מתחילה כאן',
    description:
      'מארזי מתנה בהתאמה אישית לפי האדם, האירוע והתקציב שלכם.',
    locale: 'he_IL',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#faf6f0',
  width: 'device-width',
  initialScale: 1,
  /* Never cap zoom — pinch-to-zoom is an accessibility feature. */
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-dvh bg-canvas antialiased">
        {/* Parked vertically, not at left:-999px — under RTL a negative inline
            offset sits past the right edge and stretches the document. */}
        <a
          href="#main"
          className="absolute start-0 top-[-100%] z-50 m-2 rounded-card bg-ink px-5 py-3 text-canvas focus:top-2"
        >
          דילוג לתוכן הראשי
        </a>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
