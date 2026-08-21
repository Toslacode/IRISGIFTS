import { BasketUnfold } from '@/components/home/BasketUnfold';
import { Hero } from '@/components/home/Hero';
import { HomeBuilder } from '@/components/home/HomeBuilder';
import { Inspiration } from '@/components/home/Inspiration';
import { BuilderProvider } from '@/components/gift-builder/BuilderContext';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { SiteHeader } from '@/components/ui/SiteHeader';

/* Three beats and then the application: the opening film, a short look at the
   work, and the first real question. Nothing explains the product — the
   product is right there. */
export default function HomePage() {
  return (
    <>
      <SiteHeader transparent />
      <main id="main">
        <Hero />
        <BasketUnfold />
        <Inspiration />
        <BuilderProvider embedded>
          <HomeBuilder />
        </BuilderProvider>
      </main>
      <SiteFooter />
    </>
  );
}
