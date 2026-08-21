import { BasketUnfold } from '@/components/home/BasketUnfold';
import { GiftStories } from '@/components/home/GiftStories';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { MainCta } from '@/components/home/MainCta';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { SiteHeader } from '@/components/ui/SiteHeader';

export default function HomePage() {
  return (
    <>
      <SiteHeader transparent />
      <main id="main">
        <Hero />
        <BasketUnfold />
        <GiftStories />
        <HowItWorks />
        <MainCta />
      </main>
      <SiteFooter />
    </>
  );
}
