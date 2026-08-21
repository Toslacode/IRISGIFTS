import { About } from '@/components/home/About';
import { Hero } from '@/components/home/Hero';
import { HomeBuilder } from '@/components/home/HomeBuilder';
import { Inspiration } from '@/components/home/Inspiration';
import { Pillars } from '@/components/home/Pillars';
import { Visit } from '@/components/home/Visit';
import { BuilderProvider } from '@/components/gift-builder/BuilderContext';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { SiteHeader } from '@/components/ui/SiteHeader';

/* The opening film, a short look at the work, and then the application
   itself. The trust content sits below the builder, for anyone who wants to
   know who Iris is before they commit — never between the customer and the
   first question. */
export default function HomePage() {
  return (
    <>
      <SiteHeader transparent />
      <main id="main">
        <Hero />
        <Inspiration />
        <BuilderProvider embedded>
          <HomeBuilder />
        </BuilderProvider>
        <About />
        <Pillars />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
