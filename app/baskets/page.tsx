import type { Metadata } from 'next';

import { BasketCatalog } from '@/components/products/BasketCatalog';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { SiteHeader } from '@/components/ui/SiteHeader';

export const metadata: Metadata = {
  title: 'מארזים מוכנים',
  description:
    'המארזים שאנחנו מכינים הכי הרבה — לכלה, לחתן, לזוג, ליולדת ולחג. אפשר להזמין כמו שהם או להתאים אישית.',
};

export default function BasketsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <BasketCatalog />
      </main>
      <SiteFooter />
    </>
  );
}
