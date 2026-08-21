import type { Metadata } from 'next';

import { BasketDetail } from '@/components/products/BasketDetail';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { predefinedBaskets } from '@/data/baskets';

export function generateStaticParams() {
  return predefinedBaskets.map((basket) => ({ id: basket.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const basket = predefinedBaskets.find((b) => b.id === id);

  if (!basket) return { title: 'מארז לא נמצא' };

  return {
    title: basket.name,
    description: basket.description,
  };
}

export default async function BasketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main id="main">
        <BasketDetail id={id} />
      </main>
      <SiteFooter />
    </>
  );
}
